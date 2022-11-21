const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function (req, res) {
    let name = "";
    if (req.query.productName) name = req.query.productName;

    (async function () {
        try {
            let pool = await sql.connect(dbConfig)

            const ps = new sql.PreparedStatement(pool)
            ps.input('param', sql.VarChar(40))
            await ps.prepare("SELECT product.productId, product.productName, product.productPrice FROM product WHERE product.productName LIKE '%' + @param + '%'")

            let results = await ps.execute({param: name})

            let product = results.recordset

            res.render('listprod', {name: name, product: product, title: "List Products"})

        } catch (err) {
            console.dir(err);
            res.write(JSON.stringify(err));
            res.end();
        }
    })();
});

module.exports = router;
