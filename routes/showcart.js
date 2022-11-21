const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    let productList = req.session.productList
    let idForDeletion = false;
    let product;

    if (req.query.delete) {
        idForDeletion = req.query.delete;
        if (req.session.productList) {
            productList = req.session.productList;
            for (let i = 0; i < productList.length; i++) {
                product = productList[i];
                if (!product) {
                    continue
                }
                if (product.id === idForDeletion) {
                    console.log("Deleting this product: " + idForDeletion);
                    productList.splice(i, 1);
                }
            }
        }
    }
    res.render('ordertable', {product: productList, title: "ordertable"})
});



module.exports = router;
