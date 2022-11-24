const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.render('checkout', {title: "OnlyDucks Checkout"})
});

module.exports = router;
