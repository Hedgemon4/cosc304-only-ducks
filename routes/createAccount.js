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

    await (async function () {
        let pool = false
        try {
            pool = await sql.connect(dbConfig);
            const ps = new sql.PreparedStatement(pool)
            ps.input('userid', sql.VarChar(20))
            await ps.prepare("SELECT userid FROM customer WHERE userid = @userid")
            let r = await ps.execute({userid: username})

            let user = r.recordset

            let form = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                phonenum: phonenum,
                address: address,
                city: city,
                province: province,
                postalCode: postalCode,
                country: country,
                password: password
            }

            let provinces = [
                'Alberta',
                'British Columbia',
                'Manitoba',
                'New Brunswick',
                'Newfoundland and Labrador',
                'Northwest Territories',
                'Nova Scotia',
                'Nunavut',
                'Ontario',
                'Prince Edward Island',
                'Quebec',
                'Saskatchewan',
                'Yukon'
            ]

            if (user[0]) {
                res.render('signup', {
                    title: 'OnlyDucks Signup',
                    form: form,
                    provinces: provinces,
                    error: 'This username is already taken. Please choose another.'
                })
            }

        } catch (err) {
            console.dir(err)
            return false;
        } finally {
            pool.close()
        }
    })()

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
