const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function (req, res) {

    async function getCategories() {
        let pool = false
        try {
            pool = await sql.connect(dbConfig);
            let results = await pool.query("SELECT category.categoryName FROM category;")
            let categories = []
            categories.push('All')
            for (let i = 0; i < results.recordset.length; i++) {
                categories.push(results.recordset[i].categoryName)
            }

            return categories
        } catch (err) {
            console.dir(err)
        } finally {
            pool.close()
        }
    }

    let name = "";
    if (req.query.productName) name = req.query.productName;

    let category = "All";
    if (req.query.categoryName) category = req.query.categoryName;

    (async function () {
        let pool = false;
        let categories = await getCategories();
        console.log(categories)
        try {
            pool = await sql.connect(dbConfig)

            let sqlQuery = "SELECT product.productId, product.productName, product.productPrice, product.productDesc, productImageURL FROM product WHERE product.productName LIKE '%' + @param + '%'";
            let sqlQuery2 = " AND product.categoryId = (SELECT category.categoryId FROM category WHERE category.categoryName = @param2);"

            const ps = new sql.PreparedStatement(pool)
            ps.input('param', sql.VarChar(40))

            const ps1 = new sql.PreparedStatement(pool)
            ps1.input('param', sql.VarChar(40))
            ps1.input('param2', sql.VarChar(40))

            let results
            let specifyCat
            if (category === 'All') {
                await ps.prepare(sqlQuery)
                results = await ps.execute({param: name})
                // this is for displaying later
                category = 'Products';
                specifyCat = '';
            } else {
                await ps1.prepare(sqlQuery + sqlQuery2)
                results = await ps1.execute({param: name, param2: category})
                // this is for displaying later
                specifyCat = 'in ' + category;
            }

            let product = results.recordset
            res.render('listprod', {
                categories: categories,
                name: name,
                category: category,
                specifyCat: specifyCat,
                product: product,
                title: "OnlyDucks Products"
            })

        } catch (err) {
            console.dir(err);
            res.end();
        } finally {
            pool.close()
        }
    })();
});

module.exports = router;
