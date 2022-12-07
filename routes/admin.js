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
                            console.log(result)
                            ps.unprepare((err) => {
                                if (err) {
                                    console.error(err)
                                }
                            })
                        })
                    })

                }
                let wQuery="SELECT warehouseId as wId, warehouseName as wName from warehouse;"
                let wResults= await pool.request().query(wQuery);
                let warehouseIds= wResults.recordset
                let productInfo=[]
                const ps= new sql.PreparedStatement(pool)
                for (let i = 0; i < warehouseIds.length; i++) {
                    let result= wResults.recordset[i];
                    //ps.input("warehouseId",sql.Int)
                    let result2 = await pool.request().input('warehouseId', sql.Int, result.wId).query("SELECT p.productId AS productid, product.productName AS productname, p.warehouseId AS warehouseid ,p.quantity AS quantity FROM productInventory AS p JOIN product ON product.productId = p.productId WHERE p.warehouseId = @warehouseId ORDER BY p.productId;")
                    productInfo.push(result2.recordset)
                }
                //console.log(productInfo[0])
                //console.log(warehouseIds)
                res.render('admin', {dailySales: sales, warehouses: warehouseIds, products: productInfo,title: "OnlyDucks Administrator Panel"})
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
