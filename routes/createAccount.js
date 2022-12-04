const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.post('/', function (req, res) {
    (async () => {
        let createAccount = await createAccount(req);
        if (createAccount) {
            res.redirect("/");
        }
            res.redirect("/login")
    })();
});

async function createAccount(req) {
    if (!req.body || !req.body.firstName || !req.body.lastName || !req.body.userName ||
    !req.body.email|| !req.body.password || !req.body.address ||
    !req.body.city || !req.body.province || !req.body.postalCode || !req.body.country) {
        return false;
    }

    let firstName = req.body.firstName
    let lastName = req.body.lastName
    let username = req.body.username
    let email = req.body.email
    let password = req.body.password
    let address = req.body.address
    let city = req.body.city
    let province = req.body.province
    let postalCode = req.body.postalCode
    let country = req.body.country

    let createAccount = await (async function () {
        let pool = false
        try {
            pool = await sql.connect(dbConfig);

            // If so, set authenticatedUser to be the username.\
            const ps = new sql.PreparedStatement(pool)
            // firstName           VARCHAR(40),
            //     lastName            VARCHAR(40),
            //     email               VARCHAR(50),
            //     phonenum            VARCHAR(20),
            //     address             VARCHAR(50),
            //     city                VARCHAR(40),
            //     state               VARCHAR(20),
            //     postalCode          VARCHAR(20),
            //     country             VARCHAR(40),
            //     userid              VARCHAR(20),
            //     password            VARCHAR(30),
            ps.input('firstName', sql.VarChar(40))
            ps.input('lastName', sql.VarChar(40))
            ps.input('email', sql.VarChar())
            await ps.prepare(
                "INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES(@firstName, @lastName, @email, @phonenum, @address, @city, @state, @postalCode, @country, @userid, @password)"
            )

            let results = await ps.execute({userId: username, password: password})

            let user = results.recordset

            if (user[0])
                return username

            return false;
        } catch (err) {
            console.dir(err)
            return false;
        } finally {
            pool.close()
        }
    })();

    return createAccount
}

module.exports = router
