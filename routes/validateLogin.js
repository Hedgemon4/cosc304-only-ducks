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
        try {
            let pool = await sql.connect(dbConfig);

            // If so, set authenticatedUser to be the username.\
            const ps = new sql.PreparedStatement(pool)
            ps.input('userId', sql.VarChar(20))
            ps.input('password', sql.VarChar(30))
            await ps.prepare("SELECT userid, password FROM customer WHERE userid = @userId AND password = @password")

            let results = await ps.execute({userId: username, password: password})

            let user = results.recordset

            if (user[0])
                return username;

            return false;
        } catch (err) {
            console.dir(err);
            return false;
        }
    })();

    return authenticatedUser;
}

module.exports = router;
