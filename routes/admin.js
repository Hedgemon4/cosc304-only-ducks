const express = require('express')
const router = express.Router()
const auth = require('../auth')
const sql = require('mssql')

router.get('/', function (req, res, next) {
    if(auth.checkAuthentication(req, res) && auth.checkAdmin(req, res)) {
        (async function () {
            let pool = false
            try {
                pool = await sql.connect(dbConfig)
                let sqlQuery = "SELECT CAST(orderDate AS DATE) AS date, SUM(totalAmount) AS dailyTotal FROM ordersummary GROUP BY CAST(orderDate AS DATE)"
                let results = await pool.request().query(sqlQuery)
                let sales = results.recordset
                res.render('admin', {dailySales: sales, title: "OnlyDucks Administrator Panel"})
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
