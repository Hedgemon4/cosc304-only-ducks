const express = require('express');
const router = express.Router();
const sql = require('mssql');
require('moment');
const auth = require("../auth");

router.get('/', function (req, res) {
    if (auth.checkAuthentication(req, res)) {
        (async function () {
            let pool = false
            try {
                pool = await sql.connect(dbConfig)
                const ps = new sql.PreparedStatement(pool)
                ps.input('customerId', sql.VarChar(20))

                let customerId = req.session.customerId

                await ps.prepare("SELECT ordersummary.orderId, orderSummary.orderDate, customer.firstName, customer.lastName, ordersummary.totalAmount FROM ordersummary JOIN customer ON ordersummary.customerId = customer.customerId WHERE customer.customerId = @customerId")

                let results = await ps.execute({customerId: customerId})

                let orders = results.recordset

                let products = []

                for (let i = 0; i < results.recordset.length; i++) {
                    let result = results.recordset[i];
                    let results2 = await pool.request().input('orderId', sql.Int(), result.orderId).query("SELECT orderproduct.productId, orderproduct.quantity, orderproduct.price, product.productName FROM orderproduct JOIN product ON orderproduct.productId = product.productId WHERE orderproduct.orderId = @orderId;");
                    products.push(results2.recordset)
                }

                res.render('viewOrders', {order: orders, products: products, title: "Your OnlyDucks Order History"})
            } catch (err) {
                console.dir(err);
                res.end();
            } finally {
                pool.close()
            }
        })()
    }
})

module.exports = router;
