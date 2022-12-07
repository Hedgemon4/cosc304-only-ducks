const express = require('express');
const sql = require("mssql");
const router = express.Router();

router.get('/', function (req, res) {
    let productList = req.session.productList
    let idForDeletion = false;
    let idForUpdate = false;
    let newQuantity = false;
    let product;

    let customerId = false

    if (req.query.delete) {
        idForDeletion = parseInt(req.query.delete);
        if (req.session.productList) {
            productList = req.session.productList;
            for (let i = 0; i < productList.length; i++) {
                product = productList[i];
                if (!product) {
                    continue
                }
                let id = parseInt(product.id);
                if (id === idForDeletion) {
                    productList.splice(i, 1);
                    (async () => {
                        if (req.session.customerId) {
                            customerId = req.session.customerId
                            let pool = false
                            try {
                                let customerId = req.session.customerId
                                pool = await sql.connect(dbConfig);
                                const ps = new sql.PreparedStatement(pool)
                                ps.input('customerId', sql.Int)
                                ps.input('productId', sql.Int)
                                await ps.prepare('DELETE FROM incart WHERE customerId = @customerId AND productId = @productId')
                                await ps.execute({customerId: customerId, productId: idForDeletion})
                            } catch (err) {
                                console.dir(err)
                            } finally {
                                pool.close()
                            }
                        }
                    })();
                }
            }
        }
    }

    if (req.query.update && req.query.newqty) {
        idForUpdate = parseInt(req.query.update);
        newQuantity = parseInt(req.query.newqty);
        if (req.session.productList) {
            productList = req.session.productList;
            for (let i = 0; i < productList.length; i++) {
                product = productList[i];
                if (!product) {
                    continue
                }
                let id = parseInt(product.id);
                if (id === idForUpdate) {
                    product.quantity = newQuantity;
                    (async () => {
                        if (req.session.customerId) {
                            customerId = req.session.customerId
                            let pool = false
                            try {
                                let customerId = req.session.customerId
                                pool = await sql.connect(dbConfig);
                                const ps = new sql.PreparedStatement(pool)
                                ps.input('customerId', sql.Int)
                                ps.input('productId', sql.Int)
                                ps.input('quantity', sql.Int)
                                await ps.prepare('UPDATE incart SET quantity = @quantity WHERE customerId = @customerId AND productId = @productId')
                                await ps.execute({
                                    quantity: newQuantity,
                                    customerId: customerId,
                                    productId: idForUpdate
                                })
                            } catch (err) {
                                console.dir(err)
                            } finally {
                                pool.close()
                            }
                        }
                    })();
                }
            }
        }
    }

    res.render('showcart', {product: productList, title: "OnlyDucks Cart"})
});


module.exports = router;
