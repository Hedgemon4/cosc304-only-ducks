const express = require('express');
const router = express.Router();
const sql = require('mssql');
const auth = require('../auth');

router.get('/', function (req, res, next) {
    if (!auth.checkAuthentication(req, res)) {
        res.redirect('/login')
        return
    }
        (async function () {
            let pool = false
            try {
                let username = req.session.authenticatedUser
                pool = await sql.connect(dbConfig)
                const ps = new sql.PreparedStatement(pool)
                ps.input('userId', sql.VarChar(20))
                await ps.prepare("SELECT * FROM customer WHERE userid = @userId")
                let results = await ps.execute({userId: username})
                let customer = results.recordset[0]
                res.render('customer', {customer: customer, title: "Customer Information: " + username})
            } catch (err) {
                console.dir(err)
                res.end()
            } finally {
                pool.close()
            }
        })();
});

module.exports = router;
