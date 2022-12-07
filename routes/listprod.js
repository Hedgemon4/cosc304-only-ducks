const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function (req, res) {
    let name = "";
    if (req.query.productName) name = req.query.productName;

    (async function () {
        let pool = false;
        try {
            pool = await sql.connect(dbConfig)

            const ps = new sql.PreparedStatement(pool)
            ps.input('param', sql.VarChar(40))
            await ps.prepare("SELECT product.productId, product.productName, product.productPrice, product.productDesc, productImageURL, COUNT(orderproduct.productId) FROM product LEFT JOIN orderproduct ON product.productId = orderproduct.productId WHERE product.productName LIKE '%' + @param + '%' GROUP BY product.productId, product.productName, product.productPrice, product.productDesc, productImageURL ORDER BY COUNT(orderproduct.productId) DESC")

            let results = await ps.execute({param: name})

            let product = results.recordset

            console.log(product)

            res.render('listprod', {name: name, product: product, title: "OnlyDucks Products"})

        } catch (err) {
            console.dir(err);
            res.end();
        } finally {
            pool.close()
        }
    })();
});

module.exports = router;
