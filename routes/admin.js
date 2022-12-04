const express = require('express')
const router = express.Router()
const auth = require('../auth')
const sql = require('mssql')

router.get('/', function (req, res) {
    if (auth.checkAuthentication(req, res)) {
        (async function () {
            let pool = false
            try {
                pool = await sql.connect(dbConfig)
                let sqlQuery = "SELECT CAST(orderDate AS DATE) AS date, SUM(totalAmount) AS dailyTotal FROM ordersummary GROUP BY CAST(orderDate AS DATE)"
                let results = await pool.request().query(sqlQuery)
                let sales = results.recordset

                let sqlQuery2 = "SELECT product.productName, SUM(orderproduct.quantity) AS totalQuantity, COUNT(orderproduct.productId) AS numOrders FROM product JOIN orderproduct ON product.productId = orderproduct.productId GROUP BY product.productName ORDER BY totalQuantity DESC;"
                let results2 = await pool.request().query(sqlQuery2)
                let sales2 = results2.recordset

                console.log(sales2)

                res.render('admin', {dailySales: sales, productSales: sales2, title: "OnlyDucks Administrator Panel"})
            } catch (err) {
                console.dir(err)
                res.end()
            } finally {
                pool.close
            }
        })()
    }
})

module.exports = router
