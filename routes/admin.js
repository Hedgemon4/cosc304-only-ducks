const express = require('express')
const router = express.Router()
const auth = require('../auth')
const sql = require('mssql')

router.get('/', function (req, res) {
    if (auth.checkAuthentication(req, res) && auth.checkAdmin(req, res)) {
        (async function () {
            let pool = false
            try {
                pool = await sql.connect(dbConfig)

                let dailySalesQuery = "SELECT CAST(orderDate AS DATE) AS date, SUM(totalAmount) AS dailyTotal FROM ordersummary GROUP BY CAST(orderDate AS DATE)"
                let results = await pool.request().query(dailySalesQuery)
                let sales = results.recordset

                let customersQuery = "SELECT * FROM customer WHERE isAdmin <> 1"
                results = await pool.request().query(customersQuery)
                let customers = results.recordset

                res.render('admin', {
                    dailySales: sales,
                    allCustomers: customers,
                    title: "OnlyDucks Administrator Panel"
                })
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
