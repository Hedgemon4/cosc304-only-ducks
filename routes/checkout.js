const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    if(req.session.authenticatedUser) {
        res.render('checkout', {title: "OnlyDucks Checkout"})
    } else{
        req.session.loginMessage = "Please login to complete your order."
        res.redirect('/login')
    }
});

module.exports = router;
