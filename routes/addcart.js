const express = require('express');
const sql = require("mssql");
const router = express.Router();

router.get('/', function (req, res) {
    // If the product list isn't set in the session,
    // create a new list.
    let productList = false;
    if (!req.session.productList) {
        productList = [];
    } else {
        productList = req.session.productList;
    }

    // Add new product selected
    // Get product information
    let id = false;
    let name = false;
    let price = false;
    if (req.query.id && req.query.name && req.query.price) {
        id = req.query.id;
        name = req.query.name;
        price = req.query.price;
    } else {
        res.redirect("/listprod");
    }

    // Update quantity if add same item to order again
    let update = false
    if (productList[id]) {
        productList[id].quantity = productList[id].quantity + 1;
        update = true
    } else {
        productList[id] = {
            "id": id,
            "name": name,
            "price": price,
            "quantity": 1
        };
    }

    let customerId = false
    let quantity = productList[id].quantity;

    if (req.session.customerId) {
        customerId = req.session.customerId;
        (async () => {
            let pool = false
            try {
                pool = await sql.connect(dbConfig);
                if (!update) {
                    const insertInCart = new sql.PreparedStatement(pool)
                    insertInCart.input('customerId', sql.Int)
                    insertInCart.input('productId', sql.Int)
                    insertInCart.input('quantity', sql.Int)
                    insertInCart.input('price', sql.Decimal(10, 2))
                    await insertInCart.prepare('INSERT INTO incart (customerId, productId, quantity, price) VALUES(@customerId, @productId, @quantity, @price)')
                    await insertInCart.execute({
                        customerId: customerId,
                        productId: id,
                        quantity: quantity,
                        price: price
                    })
                } else {
                    const ps = new sql.PreparedStatement(pool)
                    ps.input('customerId', sql.Int)
                    ps.input('productId', sql.Int)
                    ps.input('quantity', sql.Int)
                    await ps.prepare('UPDATE incart SET quantity = @quantity WHERE customerId = @customerId AND productId = @productId')
                    await ps.execute({quantity: quantity, customerId: customerId, productId: id})
                }
            } catch (err) {
                console.dir(err)
            } finally {
                pool.close()
            }
        })();
    }

    req.session.productList = productList;
    res.redirect("/showcart");
});

module.exports = router;
