const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function (req, res) {
    let name = "";
    if (req.query.productName) name = req.query.productName;

    let category = "";
    if (req.query.categoryName) category = req.query.categoryName;

    (async function () {
        let pool = false;
        try {
            pool = await sql.connect(dbConfig)

            console.log("\t\t\t" + category);

            const ps = new sql.PreparedStatement(pool)
            ps.input('param', sql.VarChar(40))

            const ps1 = new sql.PreparedStatement(pool)
            ps1.input('param', sql.VarChar(40))
            ps1.input('param2', sql.VarChar(40))

            let results
            if (category === 'All') {
                await ps.prepare("SELECT product.productId, product.productName, product.productPrice, product.productDesc, productImageURL FROM product WHERE product.productName LIKE '%' + @param + '%'")
                results = await ps.execute({param: name})
            } else {
                await ps1.prepare("SELECT product.productId, product.productName, product.productPrice, product.productDesc, productImageURL FROM product WHERE product.productName LIKE '%' + @param + '%' AND product.categoryId = (SELECT category.categoryId FROM category WHERE category.categoryName = @param2);")
                results = await ps1.execute({param: name, param2: category})
            }

            let product = results.recordset

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
