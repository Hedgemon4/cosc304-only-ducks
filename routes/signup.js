const express = require('express');
const router = express.Router();
const auth = require('../auth');
const sql = require('mssql');

router.get('/', function (req, res) {
    res.render('signup', {title: 'OnlyDucks Signup'})
})

module.exports = router