const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

router.get('/', function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>Only Ducks Grocery Order Processing</title>");

    let productList = false;
    if (req.session.productList && req.session.productList.length > 0) {
        productList = req.session.productList;
    }

    // determine if there are products in the shopping cart
    if (productList.length === 0) {
        res.write('<h1>Your shopping cart is empty!</h1>');
    }

    let customerId = false;
    if (req.query.customerId) customerId = req.query.customerId;

    function isPositiveInteger(str) {
        if (typeof str !== 'string') {
            return false;
        }
        const num = Number(str);
        return Number.isInteger(num) && num > 0;
    }

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
            res.write(JSON.stringify(err));
            res.end();
        }
    }

    // (async () => {
    //     if (isPositiveInteger(customerId) && await idInDatabase()) {
    //         let orderTotal = 0
    //         for(let i = 0; i < productList.length; i++){
    //             product = productList[i];
    //             if (!product) {
    //                 continue
    //             }
    //             orderTotal = orderTotal + product.quantity * product.price
    //         }
    //         sqlQuery = "INSERT INTO ordersummary(customerId, orderDate, totalAmount) OUTPUT INSERTED.orderId VALUES(@custId, @date, @total)"
    //         let pool = await sql.connect(dbConfig);
    //         const ps = new sql.PreparedStatement(pool)
    //         ps.input('custId', sql.Int)
    //         ps.input('date', sql.DATETIME)
    //         ps.input('total', sql.DECIMAL(10,2))
    //         ps.prepare(sqlQuery)
    //
    //         let result = ps.execute({custId: customerId, date: new Date(), total: 0})
    //
    //         console.log(result.recordset[0].orderId)
    //
    //         ps.unprepare()
    //     }
    // })()

    // determine if a valid customer id was entered
    (async () => {
        if (isPositiveInteger(customerId) && await idInDatabase()) {
            sqlQuery = "INSERT INTO ordersummary (customerId, orderDate, totalAmount) OUTPUT INSERTED.orderId VALUES(@custId, @date, @total)"
            let pool = await sql.connect(dbConfig);
            const ps = new sql.PreparedStatement(pool)

            ps.input('custId', sql.Int)
            ps.input('date', sql.DATETIME)
            ps.input('total', sql.DECIMAL(10,2))

            await ps.prepare(sqlQuery)

            let result = await ps.execute({custId: customerId, date: new Date(), total: 0})

            let orderId = result.recordset[0].orderId

            ps.unprepare()

            res.write('<h1>Your Order Summary</h1>');
            res.write("<table><tr><th>Product Id</th><th>Product Name</th><th>Quantity</th>");
            res.write("<th>Price</th><th>Subtotal</th></tr>");

            // TODO: need to call function to insert order summary into DB

            let total = 0;
            for (let i = 0; i < productList.length; i++) {
                product = productList[i];
                if (!product) {
                    continue
                }

                // TODO: need to call function to insert orderproduct into DB

                res.write("<tr><td>" + product.id + "</td>");
                res.write("<td>" + product.name + "</td>");

                res.write("<td align=\"center\">" + product.quantity + "</td>");

                res.write("<td align=\"right\">$" + Number(product.price).toFixed(2) + "</td>");
                res.write("<td align=\"right\">$" + (Number(product.quantity.toFixed(2)) * Number(product.price)).toFixed(2) + "</td></tr>");
                res.write("</tr>");
                total = total + product.quantity * product.price;
            }
            res.write("<tr><td colspan=\"4\" align=\"right\"><b>Order Total</b></td><td align=\"right\">$" + total.toFixed(2) + "</td></tr>");
            res.write("</table>");
            res.write('<h1>Order completed. Will be shipped soon...</h1>');
            res.write('<h1>Your order reference number is: </h1>');
            res.write('<h1>Shipping to customer: ' + customerId + ' Name: ' + shippingTo + '</h1>');
            res.end();
        } else {
            res.write('<h1>Invalid customer id. Go back to the previous page and try again.</h1>')
            res.end();
        }
    })()

    /** Make connection and validate **/

    /** Save order information to database**/

        /**
        // Use retrieval of auto-generated keys.
        sqlQuery = "INSERT INTO <TABLE> OUTPUT INSERTED.orderId VALUES( ... )";
        let result = await pool.request()
            .input(...)
            .query(sqlQuery);
        // Catch errors generated by the query
        let orderId = result.recordset[0].orderId;
        **/

    /** Insert each item into OrderedProduct table using OrderId from previous INSERT **/

    /** Update total amount for order record **/

    /** For each entry in the productList is an array with key values: id, name, quantity, price **/

    /** Clear session/cart **/
});


module.exports = router;
