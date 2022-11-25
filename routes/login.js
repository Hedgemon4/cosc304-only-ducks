const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
    // Set the message for the login, if present
    let loginMessage = false;
    if (req.session.loginMessage) {
        loginMessage = req.session.loginMessage;
        req.session.loginMessage = false;
    }

    if (!req.session.authenticatedUser) {
        res.render('login', {
            title: "OnlyDucks Login",
            loginMessage: loginMessage
        });
    } else {
        res.redirect('/')
    }
})

module.exports = router
