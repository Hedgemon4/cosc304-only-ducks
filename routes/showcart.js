const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    let productList = req.session.productList
    res.render('ordertable', {product: productList, title: "ordertable"})
});

module.exports = router;
