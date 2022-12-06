const express = require('express');
const router = express.Router();
const auth = require('../auth');
const sql = require('mssql');

router.post('/', function (req, res) {
    // Have to preserve async context since we make an async call
    // to the database in the validateLogin function.

    (async () => {
        let authenticatedUser = await validateLogin(req);
        if (authenticatedUser) {
            req.session.authenticatedUser = authenticatedUser
            if (req.session.loginRedirect) {
                req.session.loginRedirect = false
                await loadCart(req, res)
                res.redirect("/checkout");
            } else {
                await loadCart(req, res)
                res.redirect("/");
            }
        } else {
            res.redirect("/login")
        }
    })();
})

async function validateLogin(req) {
    if (!req.body || !req.body.username || !req.body.password) {
        return false;
    }

    let username = req.body.username;
    let password = req.body.password;
    let authenticatedUser = await (async function () {
        let pool = false
        try {
            pool = await sql.connect(dbConfig);

            // If so, set authenticatedUser to be the username.\
            const ps = new sql.PreparedStatement(pool)
            ps.input('userId', sql.VarChar(20))
            ps.input('password', sql.VarChar(30))
            await ps.prepare("SELECT userid, password, customerId, isAdmin FROM customer WHERE userid = @userId AND password = @password")

            let results = await ps.execute({userId: username, password: password})

            let user = results.recordset

            if (user[0]) {
                req.session.customerId = user[0].customerId
                req.session.isAdmin = user[0].isAdmin
                return username
            } else {
                req.session.loginMessage = "Invalid login provided. Please try again."
                return false
            }
        } catch (err) {
            console.dir(err)
            return false;
        } finally {
            pool.close()
        }
    })();

    return authenticatedUser
}

async function loadCart(req, res) {
    let pool = false
    try {
        pool = await sql.connect(dbConfig)

        const ps = new sql.PreparedStatement(pool)
        let customerId = req.session.customerId
        ps.input('customerId', sql.Int)
        await ps.prepare('SELECT incart.orderId, incart.productId, incart.quantity, incart.price, product.productName FROM incart JOIN ordersummary ON incart.orderId = ordersummary.orderId JOIN product ON incart.productId = product.productId WHERE ordersummary.customerId = @customerId')
        let results = await ps.execute({customerId: customerId})
        let cart = results.recordset

        let orderId = false
        let products = []

        // Get or create productList
        let productList = false;
        if (!req.session.productList) {
            productList = []
        } else {
            productList = req.session.productList
        }
        if (cart[0]) {
            // If incart has values
            orderId = cart[0].incart.orderId
            req.session.orderId = orderId
            for (let i = 0; i < cart.length; i++) {
                // want to add inCart values to the session, and update the database if the cart also had some values
                let id = cart[i].incart.productId
                let name = cart[i].product.productName
                let price = cart[i].incart.price
                let quantity = cart[i].incart.quantity
                products.push(id)
                if (productList[id]) {
                    quantity += productList[id].quantity
                    productList[id].quantity = quantity
                    const updateInCart = new sql.PreparedStatement(pool)
                    updateInCart.input('orderId', sql.Int)
                    updateInCart.input('productId', sql.Int)
                    updateInCart.input('quantity', sql.Int)
                    await updateInCart.prepare('UPDATE incart SET quantity = @quantity WHERE orderId = @orderId AND productId = @productId')
                    await updateInCart.execute({orderId: orderId, productId: id, quanity: quantity})
                } else {
                    productList[id] = {
                        "id": id,
                        "name": name,
                        "price": price,
                        "quantity": quantity
                    };
                }
            }
        } else {
            // if incart does not have values

            // make a new order
            const ps2 = new sql.PreparedStatement(pool)
            ps2.input('customerId', sql.Int)
            ps2.input('date', sql.DateTime)
            await ps2.prepare('INSERT INTO ordersummary (customerId, orderDate, totalAmount) OUTPUT INSERTED.orderId VALUES (@customerId, @date, 0)')
            let results = await ps2.execute({customerId: customerId, date: new Date()})
            orderId = results.recordset[0].orderId
            req.session.orderId = orderId
        }

        // Then, we need to insert any items in the session but not in the database into the database

        const insertInCart = new sql.PreparedStatement(pool)
        insertInCart.input('orderId', sql.Int)
        insertInCart.input('productId', sql.Int)
        insertInCart.input('quantity', sql.Int)
        insertInCart.input('price', sql.Decimal(10, 2))
        await insertInCart.prepare('INSERT INTO incart (orderId, productId, quantity, price) VALUES(@orderId, @productId, @quantity, @price)')

        for (let i = 0; i < productList.length; i++) {
            let product = productList[i]
            // If there is not a product or it is already in the database, we continue
            if (!product || products.includes(product.id)) {
                continue
            }

            // otherwise, add it
            await insertInCart.execute({
                orderId: orderId,
                productId: product.id,
                quantity: product.quantity,
                price: product.price
            })
        }

    } catch (err) {
        console.dir(err)
        return false;
    } finally {
        pool.close()
    }
}

module.exports = router
