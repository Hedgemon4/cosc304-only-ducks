const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function (req, res) {
    res.setHeader('Content-Type', 'image/jpeg')

    let id = req.query.id
    let idVal = parseInt(id)
    if (isNaN(idVal)) {
        res.end()
        return
    }

    (async function () {
        let pool = false
        try {
            pool = await sql.connect(dbConfig)

            const ps = new sql.PreparedStatement(pool)
            ps.input('idParam', sql.Int)
            await ps.prepare("SELECT productImage FROM product WHERE product.productId = @idParam")

            let result = await ps.execute({idParam: idVal})

            if (result.recordset.length === 0) {
                console.log("No image record")
                res.end()
                return
            } else {
                let productImage = result.recordset[0].productImage
                res.write(productImage)
            }

            res.end()
        } catch (err) {
            console.dir(err)
            res.end()
        } finally {
            pool.close()
        }
    })()
})

module.exports = router
