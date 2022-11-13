const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>Only Ducks</title>");
    res.write('<h1>Search for the products you want to buy:</h1>');
    res.write('<form method="get" action="/listprod">');
    res.write('<input type="text" name="productName" size="50">');
    res.write('<input type="submit" value="Submit"><input type="reset" value="Reset">');
    res.write('</form>');

    let name = "";
    if (req.query.productName) name = req.query.productName;

    if (name === "") res.write('<h2>All Products</h2>');
    else res.write('<h2>Products containing \'' + name + '\'</h2>');

    (async function () {
        try {
            let pool = await sql.connect(dbConfig)

            const ps = new sql.PreparedStatement(pool)
            ps.input('param', sql.VarChar(40))
            await ps.prepare("SELECT product.productId, product.productName, product.productPrice FROM product WHERE product.productName LIKE '%' + @param + '%'")

            let results = await ps.execute({param: name})

            if (results.recordset.length !== 0) {
                res.write("<table><tr><th></th><th>Product Name</th><th>Price</th></tr>");
                for (let i = 0; i < results.recordset.length; i++) {
                    let result = results.recordset[i];
                    let productPrice = result.productPrice;
                    res.write("<tr><td><a href=\"addcart?id=" + result.productId + "&name=" + result.productName + "&price=" + productPrice.toFixed(2) + "\">Add to Cart</a></td><td>" + result.productName + "</td><td>" + "$" + productPrice.toFixed(2) + "</td></tr>");
                }
                res.write("</table>");
            }
            res.end();
        } catch (err) {
            console.dir(err);
            res.write(JSON.stringify(err));
            res.end();
        }
    })();
});

module.exports = router;
