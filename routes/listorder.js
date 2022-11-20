const express = require('express');
const router = express.Router();
const sql = require('mssql');
require('moment');

router.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.write('<title>OnlyDucks Order List</title>');
    res.write('<h1>Order List</h1>');
    // table, th, td { border: 1px solid; border-collapse: collapse; } table { width: 70%; }
    res.write('<style></style>');

    (async function () {
        try {
            let pool = await sql.connect(dbConfig);

            let sqlQuery = "SELECT ordersummary.orderId, ordersummary.customerId, customer.firstName, customer.lastName, ordersummary.totalAmount FROM ordersummary JOIN customer ON ordersummary.customerId = customer.customerId;";

            let results = await pool.request().query(sqlQuery);
            res.write("<table border='1'><tr><th>Order Id</th><th>Customer Id</th><th>Customer Name</th><th>Total Amount</th></tr>");
            for (let i = 0; i < results.recordset.length; i++) {
                let result = results.recordset[i];
                let totalAmount = result.totalAmount;
                res.write("<tr><td>" + result.orderId + "</td><td>" + result.customerId + "</td><td>" + result.firstName + " " + result.lastName + "</td><td>" + "$" + totalAmount.toFixed(2) + "</td></tr>");

                let results2 = await pool.request().input('orderId', sql.Int(), result.orderId).query("SELECT orderproduct.productId, orderproduct.quantity, orderproduct.price FROM orderproduct WHERE orderproduct.orderId = @orderId;");
                res.write("<tr align='right'><td colspan='4'><table border='1'><th>Product Id</th><th>Quantity</th><th>Price</th></tr>");
                for (let i = 0; i < results2.recordset.length; i++) {
                    let result2 = results2.recordset[i];
                    let price = result2.price;
                    res.write("<tr><td>" + result2.productId + "</td><td>" + result2.quantity + "</td><td>" + "$" + price.toFixed(2) + "</td></tr>");
                }
                res.write("</table></td></tr>");
            }
            res.write("</table>");
            res.end();
        } catch (err) {
            console.dir(err);
            res.write(JSON.stringify(err));
            res.end();
        }
    })();
});

module.exports = router;
