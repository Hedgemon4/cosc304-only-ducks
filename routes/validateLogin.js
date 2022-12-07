const express = require('express');
const router = express.Router();
const auth = require('../auth');
const sql = require('mssql');

router.post('/', function (req, res) {
    // Have to preserve async context since we make an async call to the database in the validateLogin function.

    (async () => {
        let authenticatedUser = await validateLogin(req);
        if (authenticatedUser) {
            req.session.authenticatedUser = authenticatedUser
            if (req.session.loginRedirect) {
                req.session.loginRedirect = false
                req.session.productList = await loadCart(req, res)
                res.redirect("/checkout");
            } else {
                req.session.productList = await loadCart(req, res)
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
            await ps.prepare("SELECT userid, password, customerId, isAdmin FROM customer WHERE userid = @userId COLLATE Latin1_General_CS_AS AND password = @password COLLATE Latin1_General_CS_AS")

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
    let productList = false;
    // Need to load items in stored cart on login
    try {
        pool = await sql.connect(dbConfig)
        const ps = new sql.PreparedStatement(pool)
        let customerId = req.session.customerId
        ps.input('customerId', sql.Int)
        await ps.prepare('SELECT incart.productId, incart.customerId, incart.quantity, incart.price, product.productName FROM incart JOIN product ON incart.productId = product.productId WHERE customerId = @customerId')
        let results = await ps.execute({customerId: customerId})
        let cart = results.recordset

        // Get or create productList
        let products = [];
        if (!req.session.productList) {
            productList = []
        } else {
            productList = req.session.productList
        }

        // Go through cart and add to productList
        if (cart[0]) {
            // If incart has values
            for (let i = 0; i < cart.length; i++) {
                // want to add inCart values to the session, and update the database if the cart also had some values
                let id = cart[i].productId
                let name = cart[i].productName
                let price = cart[i].price
                let quantity = cart[i].quantity
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
                        "id": parseInt(id),
                        "name": name,
                        "price": price,
                        "quantity": parseInt(quantity)
                    };
                }
            }
        }

        // Insert any new items into database
        for (let i = 0; i < productList.length; i++) {
            let product = productList[i];
            if (!product || products.includes(i)) {
                continue
            }
            const insertInCart = new sql.PreparedStatement(pool)
            insertInCart.input('customerId', sql.Int)
            insertInCart.input('productId', sql.Int)
            insertInCart.input('quantity', sql.Int)
            insertInCart.input('price', sql.Decimal(10, 2))
            await insertInCart.prepare('INSERT INTO incart (customerId, productId, quantity, price) VALUES(@customerId, @productId, @quantity, @price)')
            await insertInCart.execute({
                customerId: customerId,
                productId: product.id,
                quantity: product.quantity,
                price: product.price
            })

        }

    } catch (err) {
        console.dir(err)
    } finally {
        pool.close()
    }

    return productList;
}

module.exports = router
