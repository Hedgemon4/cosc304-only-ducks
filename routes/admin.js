const express = require('express')
const router = express.Router()
const auth = require('../auth')
const sql = require('mssql')

router.get('/', function (req, res, next) {
    if(auth.checkAuthentication(req, res)) {
        (async function () {
            let pool = false
            try {
                pool = await sql.connect(dbConfig)
                let sqlQuery = "SELECT CAST(orderDate AS DATE) AS date, SUM(totalAmount) AS dailyTotal FROM ordersummary GROUP BY CAST(orderDate AS DATE)"
                let results = await pool.request().query(sqlQuery)
                let sales = results.recordset
                let itemByWarehouse="Select product.productId as productid, product.productName as productname, p.warehouseId as wId, warehouse.warehouseName as wName, SUM(p.quantity) as quantity FROM productInventory p INNER JOIN product  on product.productId = p.productId INNER JOIN warehouse ON p.warehouseId=warehouse.warehouseId GROUP BY product.productId, product.productName, p.warehouseId,warehouse.warehouseName;"
                let resultsWarehouse = await pool.request().query(itemByWarehouse);
                let inventories=resultsWarehouse.recordset
                res.render('admin', {dailySales: sales, inventoriesByWarehouse: inventories, title: "OnlyDucks Administrator Panel"})
            } catch (err) {
                console.dir(err)
                res.end()
            }finally{
                pool.close
            }

        })()
    }
})

module.exports = router
