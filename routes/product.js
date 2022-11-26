const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    let id = 0;
    if (req.query.id) id = req.query.id;

    (async function () {
        try {
            let pool = await sql.connect(dbConfig);

            // Get product name to search for
            // TODO: Retrieve and display info for the product
            const ps = new sql.PreparedStatement(pool)
            ps.input('param', sql.VarChar(40))
            await ps.prepare("SELECT product.productId, product.productName, product.productPrice, product.productDesc, productImageURL  FROM product WHERE product.productId = @param")
            let result = await ps.execute({param: id})

            let product = result.recordset

            // TODO: If there is a productImageURL, display using IMG tag

            // TODO: Retrieve any image stored directly in database. Note: Call displayImage.jsp with product id as parameter.

            // TODO: Add links to Add to Cart and Continue Shopping

            res.render('productDetails', {id: id, product: product, title: "OnlyDucks Products"})
        } catch (err) {
            console.dir(err);
            res.write(err + "")
            res.end();
        }
    })();
});

module.exports = router;
