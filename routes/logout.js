const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    req.session.authenticatedUser = false
    req.session.customerId = false
    res.redirect("/")
});

module.exports = router
