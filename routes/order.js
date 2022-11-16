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

    // determine if a valid customer id was entered
    (async () => {
        if (isPositiveInteger(customerId) && await idInDatabase()) {
            let sqlQuery = "INSERT INTO ordersummary (customerId, orderDate, totalAmount) OUTPUT INSERTED.orderId VALUES(@custId, @date, @total)"
            let pool = await sql.connect(dbConfig);
            const ps1 = new sql.PreparedStatement(pool)

            ps1.input('custId', sql.Int)
            ps1.input('date', sql.DATETIME)
            ps1.input('total', sql.DECIMAL(10,2))

            await ps1.prepare(sqlQuery)

            let result = await ps1.execute({custId: customerId, date: new Date(), total: 0})

            let orderId = result.recordset[0].orderId

            ps1.unprepare()

            res.write('<h1>Your Order Summary</h1>');
            res.write("<table><tr><th>Product Id</th><th>Product Name</th><th>Quantity</th>");
            res.write("<th>Price</th><th>Subtotal</th></tr>");

            // TODO: need to call function to insert order summary into DB

            const ps2 = new sql.PreparedStatement(pool)
            sqlQuery = "INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, @productId, @quantity, @price)"

            ps2.input('orderId', sql.Int)
            ps2.input('productId', sql.Int)
            ps2.input('quantity', sql.Int)
            ps2.input('price', sql.DECIMAL(10,2))

            await ps2.prepare(sqlQuery)

            let total = 0;
            for (let i = 0; i < productList.length; i++) {
                let product = productList[i];
                if (!product) {
                    continue
                }

                await ps2.execute({orderId: orderId, productId: product.id, quantity: product.quantity, price: product.price})

                // TODO: need to call function to insert orderproduct into DB

                res.write("<tr><td>" + product.id + "</td>");
                res.write("<td>" + product.name + "</td>");

                res.write("<td align=\"center\">" + product.quantity + "</td>");

                res.write("<td align=\"right\">$" + Number(product.price).toFixed(2) + "</td>");
                res.write("<td align=\"right\">$" + (Number(product.quantity.toFixed(2)) * Number(product.price)).toFixed(2) + "</td></tr>");
                res.write("</tr>");
                total = total + product.quantity * product.price;
            }

            ps2.unprepare()

            const ps3 = new sql.PreparedStatement(pool)
            sqlQuery = "UPDATE ordersummary SET totalAmount = @total WHERE orderId = @orderId"

            ps3.input('total', sql.DECIMAL(10,2))
            ps3.input('orderId', sql.Int)

            await ps3.prepare(sqlQuery)

            await ps3.execute({total: total, orderId: orderId})

            ps3.unprepare()

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

// We did it Joe
