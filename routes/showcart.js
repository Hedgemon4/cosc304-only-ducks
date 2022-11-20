const express = require('express');
require("mssql");
const router = express.Router();

router.get('/', function (req, res) {
    let productList = false;
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>Your Shopping Cart</title>");

    function updateQuantity(prodId, quantity) {
        console.log("Hi");
    }

    let idForDeletion = false;
    let product;
    if (req.query.delete) {
        idForDeletion = req.query.delete;
        if (req.session.productList) {
            productList = req.session.productList;
            for (let i = 0; i < productList.length; i++) {
                product = productList[i];
                if (!product) {
                    continue
                }
                if (product.id === idForDeletion) {
                    console.log("Deleting this product: " + idForDeletion);
                    productList.splice(i, 1);
                }
            }
        }
    }

    if (req.session.productList) {
        productList = req.session.productList;
        res.write("<h1>Your Shopping Cart</h1>");
        res.write("<table><tr><th>Product Id</th><th>Product Name</th><th>Quantity</th>");
        res.write("<th>Price</th><th>Subtotal</th></tr>");

        let total = 0;
        for (let i = 0; i < productList.length; i++) {
            product = productList[i];
            if (!product) {
                continue
            }

            res.write("<tr><td>" + product.id + "</td>");
            res.write("<td>" + product.name + "</td>");

            res.write("<td align=\"center\"><input type='text' name='newqty" + i + "' size='3' value='1'></td>");

            res.write("<td align=\"right\">$" + Number(product.price).toFixed(2) + "</td>");
            res.write("<td align=\"right\">$" + (Number(product.quantity.toFixed(2)) * Number(product.price)).toFixed(2) +
                "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;<a href=\"showcart?delete=" + product.id + "\">Remove Item from Cart</a></td>" +
                "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;<input type=button onclick='updateQuantity(" + product.id + ", document.form1.newqty" + i + ".value)' value ='Update Quantity'</td>" +
                "</tr>");
            res.write("</tr>");
            total = total + product.quantity * product.price;
        }
        res.write("<tr><td colspan=\"4\" align=\"right\"><b>Order Total</b></td><td align=\"right\">$" + total.toFixed(2) + "</td></tr>");
        res.write("</table>");

        res.write("<h2><a href=\"checkout\">Check Out</a></h2>");
    } else {
        res.write("<h1>Your shopping cart is empty!</h1>");
    }
    res.write('<h2><a href="listprod">Continue Shopping</a></h2>');

    res.end();
});

module.exports = router;
