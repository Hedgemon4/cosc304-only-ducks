const express = require('express');
const router = express.Router();
const sql = require('mssql');
require('moment');

router.get('/', function (req, res) {
    let productList = false
    if (req.session.productList && req.session.productList.length > 0) {
        productList = req.session.productList
    }

    let customerId = req.session.customerId;

    let shippingTo;

    async function idInDatabase() {
        try {
            let pool = await sql.connect(dbConfig);
            let sqlQuery = "SELECT customer.firstName, customer.lastName FROM customer WHERE customer.customerId = @customerId";
            let result = await pool.request().input('customerId', sql.Int(), customerId).query(sqlQuery);
            if (result.recordset.length !== 0) shippingTo = result.recordset[0].firstName + ' ' + result.recordset[0].lastName;
            return result.recordset.length !== 0;
        } catch (err) {
            console.dir(err);
            res.end()
        }
    }

    // determine if a valid customer id was entered
    (async function () {
        let validId = false
        let orderId = false
        if (await idInDatabase()) {
            let pool = false
            try {
                validId = true
                let sqlQuery = "INSERT INTO ordersummary (customerId, orderDate, totalAmount) OUTPUT INSERTED.orderId VALUES(@custId, @date, @total)"
                pool = await sql.connect(dbConfig)
                const ps1 = new sql.PreparedStatement(pool)

                ps1.input('custId', sql.Int)
                ps1.input('date', sql.DATETIME)
                ps1.input('total', sql.DECIMAL(10, 2))

                await ps1.prepare(sqlQuery)

                let result = await ps1.execute({custId: customerId, date: new Date(), total: 0})

                orderId = result.recordset[0].orderId

                ps1.unprepare()

                const ps2 = new sql.PreparedStatement(pool)
                sqlQuery = "INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, @productId, @quantity, @price)"

                ps2.input('orderId', sql.Int)
                ps2.input('productId', sql.Int)
                ps2.input('quantity', sql.Int)
                ps2.input('price', sql.DECIMAL(10, 2))

                await ps2.prepare(sqlQuery)

                let total = 0;
                for (let i = 0; i < productList.length; i++) {
                    let product = productList[i];
                    if (!product) {
                        continue
                    }

                    await ps2.execute({
                        orderId: orderId,
                        productId: product.id,
                        quantity: product.quantity,
                        price: product.price
                    })

                    total = total + product.quantity * product.price;
                }

                ps2.unprepare()

                const ps3 = new sql.PreparedStatement(pool)
                sqlQuery = "UPDATE ordersummary SET totalAmount = @total WHERE orderId = @orderId"

                ps3.input('total', sql.DECIMAL(10, 2))
                ps3.input('orderId', sql.Int)

                await ps3.prepare(sqlQuery)

                await ps3.execute({total: total, orderId: orderId})
                ps3.unprepare()

                const removeInCart = new sql.PreparedStatement(pool)
                removeInCart.input('customerId', sql.Int)
                await removeInCart.prepare('DELETE FROM incart WHERE customerId = @customerId')
                await removeInCart.execute({customerId: customerId})
                removeInCart.unprepare()

                if (validId)
                    req.session.productList = null;
            } catch (err) {
                console.dir(err)
                res.end()
            } finally {
                pool.close()
            }
        }
        res.render('order', {
            products: productList,
            validId: validId,
            orderId: orderId,
            customerId: customerId,
            customerName: shippingTo,
            title: "OnlyDucks Order"
        })
    })()
})

module.exports = router

// We did it Joe
