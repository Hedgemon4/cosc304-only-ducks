const express = require('express');
const router = express.Router();
const auth = require('../auth');
const sql = require('mssql');

router.post('/', function (req, res) {
    // Have to preserve async context since we make an async call
    // to the database in the validateLogin function.

    (async () => {
        let authenticatedUser = await validateLogin(req);
        if (authenticatedUser) {
            req.session.authenticatedUser = authenticatedUser
            if (req.session.loginRedirect) {
                req.session.loginRedirect = false
                res.redirect("/checkout");
            } else
                res.redirect("/");
        } else {
            res.redirect("/login")
        }
    })();
});

async function validateLogin(req) {
    if (!req.body || !req.body.username || !req.body.password) {
        return false;
    }

    let username = req.body.username;
    let password = req.body.password;
    let authenticatedUser = await (async function () {
        let pool = false
        try {
            pool = await sql.connect(dbConfig);

            // If so, set authenticatedUser to be the username.\
            const ps = new sql.PreparedStatement(pool)
            ps.input('userId', sql.VarChar(20))
            ps.input('password', sql.VarChar(30))
            await ps.prepare("SELECT userid, password, customerId, isAdmin FROM customer WHERE userid = @userId COLLATE Latin1_General_CS_AS AND password = @password COLLATE Latin1_General_CS_AS")

            let results = await ps.execute({userId: username, password: password})

            let user = results.recordset

            if (user[0]) {
                req.session.customerId = user[0].customerId
                req.session.isAdmin = user[0].isAdmin
                return username
            } else {
                req.session.loginMessage = "Invalid login provided. Please try again."
                return false
            }
        } catch (err) {
            console.dir(err)
            return false;
        } finally {
            pool.close()
        }
    })();

    return authenticatedUser
}

module.exports = router
