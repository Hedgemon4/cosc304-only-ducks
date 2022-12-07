const express = require('express');
const router = express.Router();
const auth = require('../auth');
const sql = require('mssql');

router.get('/', function (req, res) {
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
    let error = false
    let form = false
    if(req.session.signupError){
        error = req.session.signupError
        req.session.signupError = false
    }
    if(req.session.signupForm){
        form = req.session.signupForm
        req.session.signupForm = false
    }
    res.render('signup', {provinces: provinces, error: error, form: form, title: 'OnlyDucks Signup'})
})

module.exports = router