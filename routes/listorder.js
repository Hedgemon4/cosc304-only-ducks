const express = require('express');
const router = express.Router();
const sql = require('mssql');
require('moment');

router.get('/', function (req, res) {
        (async function () {
            try {
                let pool = await sql.connect(dbConfig);

                let sqlQuery = "SELECT ordersummary.orderId, ordersummary.customerId, customer.firstName, customer.lastName, ordersummary.totalAmount FROM ordersummary JOIN customer ON ordersummary.customerId = customer.customerId;";

                let results = await pool.request().query(sqlQuery);

                let orders = results.recordset

                let products = []

                for (let i = 0; i < results.recordset.length; i++) {
                    let result = results.recordset[i];
                    let results2 = await pool.request().input('orderId', sql.Int(), result.orderId).query("SELECT orderproduct.productId, orderproduct.quantity, orderproduct.price FROM orderproduct WHERE orderproduct.orderId = @orderId;");
                    products.push(results2.recordset)
                }

                res.render('listorder', {order : orders, products : products})
            } catch (err) {
                console.dir(err);
                res.write(JSON.stringify(err));
                res.end();
            }
        })();
});

module.exports = router;
