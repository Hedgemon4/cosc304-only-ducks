const express = require('express');
const router = express.Router();
const sql = require('mssql');
require('moment');
const auth = require("../auth");

router.get('/', function (req, res) {
    if (auth.checkAuthentication(req, res)) {
        (async function () {
            let pool = false
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
            try {
                let username = req.session.authenticatedUser
                pool = await sql.connect(dbConfig)
                const ps = new sql.PreparedStatement(pool)
                ps.input('userId', sql.VarChar(20))
                await ps.prepare("SELECT * FROM customer WHERE userid = @userId")
                let results = await ps.execute({userId: username})
                let customer = results.recordset[0]
                res.render('editAccount',
                    {
                        customer: customer,
                        provinces: provinces,
                        title: "Edit Account " + username
                    })
            } catch (err) {
                console.dir(err)
                res.end()
            } finally {
                pool.close()
            }
        })()
    }
})

router.post('/save', function (req, res) {
    if (!req.body || !req.body.firstName || !req.body.lastName || !req.body.username ||
        !req.body.email || !req.body.password || !req.body.address || !req.body.phonenum ||
        !req.body.city || !req.body.province || !req.body.postalCode || !req.body.country) {
        req.session.loginMessage = "There was data missing from the account update form. Please try again."
        res.redirect('login')
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
    let country = req.body.country;

    (async function () {
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
                "UPDATE CUSTOMER SET firstName = @firstName, lastName = @lastName, email = @email, phonenum = @phonenum, address = @address, city = @city, state = @state, postalCode = @postalCode, country = @country, userid = @userid, password = @password OUTPUT INSERTED.userid WHERE userid = @userid"
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

            let customer = results.recordset[0]

            req.session.authenticatedUser = customer.userid
            req.session.customerMessage = 'Account updated successfully!'

            res.redirect('customer')

        } catch (err) {
            console.dir(err)
            res.end()
        } finally {
            pool.close()
        }
    })()
})

module.exports = router
