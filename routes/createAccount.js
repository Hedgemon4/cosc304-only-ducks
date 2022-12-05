const express = require('express');
const router = express.Router();
const auth = require('../auth');
const sql = require('mssql');

router.post('/', function (req, res) {
    (async () => {
        let newAccount = await createAccount(req, res);

        if (newAccount) {
            req.session.loginMessage = "Account creation successful!"
        }
        res.redirect("/login")
    })();
});

async function createAccount(req, res) {
    if (!req.body || !req.body.firstName || !req.body.lastName || !req.body.username ||
        !req.body.email || !req.body.password || !req.body.address || !req.body.phonenum ||
        !req.body.city || !req.body.province || !req.body.postalCode || !req.body.country) {
        req.session.loginMessage = "There was data missing from the account creation form. Please try again."

        console.log(req.body.firstName)
        console.log(req.body.lastName)
        console.log(req.body.username)
        console.log(req.body.email)
        console.log(req.body.password)
        console.log(req.body.address)
        console.log(req.body.phonenum)
        console.log(req.body.city)
        console.log(req.body.province)
        console.log(req.body.postalCode)
        console.log(req.body.country)


        return false;
    }

    let firstName = req.body.firstName
    let lastName = req.body.lastName
    let username = req.body.username
    let email = req.body.email
    let phonenum = req.body.phonenum
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

            const ps = new sql.PreparedStatement(pool)
            ps.input('firstName', sql.VarChar(40))
            ps.input('lastName', sql.VarChar(40))
            ps.input('email', sql.VarChar(50))
            ps.input('phonenum', sql.VarChar(20))
            ps.input('address', sql.VarChar(50))
            ps.input('city', sql.VarChar(40))
            ps.input('state', sql.VarChar(20))
            ps.input('postalCode', sql.VarChar(20))
            ps.input('country', sql.VarChar(40))
            ps.input('userid', sql.VarChar(20))
            ps.input('password', sql.VarChar(30))
            await ps.prepare(
                "INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES(@firstName, @lastName, @email, @phonenum, @address, @city, @state, @postalCode, @country, @userid, @password)"
            )

            let results = await ps.execute({
                firstName: firstName,
                lastName: lastName,
                email: email,
                phonenum: phonenum,
                address: address,
                city: city,
                state: province,
                postalCode: postalCode,
                country: country,
                userid: username,
                password: password
            })

            return true;
        } catch (err) {
            console.dir(err)
            req.session.loginMessage = "There was an unexpected error with account creation. Please try again."
            return false;
        } finally {
            pool.close()
        }
        return true
    })();

    return createAccount
}

module.exports = router
