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
                let itemByWarehouse="SELECT product.productId AS productid, product.productName AS productname, p.warehouseId AS wId, warehouse.warehouseName AS wName, SUM(p.quantity) AS quantity FROM productInventory p INNER JOIN product  ON product.productId = p.productId INNER JOIN warehouse ON p.warehouseId=warehouse.warehouseId GROUP BY product.productId, product.productName, p.warehouseId,warehouse.warehouseName;"
                let resultsWarehouse = await pool.request().query(itemByWarehouse);
                let inventories=resultsWarehouse.recordset
                res.render('admin', {dailySales: sales, inventoriesByWarehouse: inventories, title: "OnlyDucks Administrator Panel"})
                console.log(req.query)
                if(req.query.update && req.query.wId && req.query.newInventory){
                    const ps = new sql.PreparedStatement(pool)
                    let productId=req.query.update
                    let wId=req.query.wId
                    let newInventory=req.query.newInventory
                    ps.input("productId", sql.Int)
                    ps.input("wId", sql.Int)
                    ps.input("newInventory", sql.Int)
                    ps.prepare("UPDATE productInventory SET quantity=@newInventory WHERE productId=@productId AND warehouseId=@wId", (err) => {
                        if (err) {
                            console.error(err)
                            return
                        }
                        ps.execute({productId: productId, wId: wId, newInventory: newInventory}, (err, result) => {
                            if (err) {
                                console.error(err)
                                return
                            }
                            // console.log(result)
                            ps.unprepare((err) => {
                                if (err) {
                                    console.error(err)
                                }
                            })
                        })
                    })

                }
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
