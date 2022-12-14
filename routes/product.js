const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', async function (req, res) {
    let id = 0;
    if (req.query.id) {
        id = req.query.id
    }

    let isValid = true
    let canReview = true
    let hasBought = true

    console.log(req.session.isValid)
    console.log(req.session.canReview)
    console.log(req.session.hasBought)

    if(typeof req.session.isValid !== 'undefined'){
        isValid = req.session.isValid;
        req.session.isValid = true
    }
    if(typeof req.session.canReview !== 'undefined'){
        canReview = req.session.canReview
        req.session.canReview = true
    }
    if(typeof req.session.hasBought !== 'undefined'){
        hasBought = req.session.hasBought;
        req.session.hasBought = true
    }

    await (async function () {
        let pool = false
        let sqlQuery;
        try {
            pool = await sql.connect(dbConfig)

            const ps = new sql.PreparedStatement(pool)
            ps.input('param', sql.VarChar(40))
            await ps.prepare("SELECT product.productId, product.productName, product.productPrice, product.productDesc, productImageURL, productImage  FROM product WHERE product.productId = @param")
            let result = await ps.execute({param: id})
            let product = result.recordset

            const psReviews = new sql.PreparedStatement(pool)
            psReviews.input('param', sql.VarChar(40))
            await psReviews.prepare("SELECT review.reviewId, review.reviewRating, review.reviewDate, review.customerId, review.productId, review.reviewComment, customer.firstName, customer.lastName FROM review JOIN customer ON review.customerId = customer.customerId WHERE review.productId = @param")
            let reviewsResult = await psReviews.execute({param: id})
            let reviews = reviewsResult.recordset

            res.render('productDetails', {
                id: id,
                product: product,
                reviews: reviews,
                isValid: isValid,
                canReview: canReview,
                hasBought: hasBought,
                title: "OnlyDucks Products"
            })

        } catch (err) {
            console.dir(err)
            res.end()
        } finally {
            pool.close()
        }


    })()
})

router.get('/addReview', async function (req, res) {
    console.log("Hello")

    let id = 0;
    if (req.query.id) {
        id = req.query.id
        console.log(id)
    }

    let isValid = true;
    if (req.query.valid) {
        isValid = req.query.valid
    }

    let rating = 0;
    if (req.query.rating) {
        rating = req.query.rating
    }

    let cId = 0;
    if (req.session.customerId) {
        cId = req.session.customerId
    }

    let comment = "";
    if (req.query.reviewComment) {
        comment = req.query.reviewComment
    }

    let canReview = true

    let hasBought = true

    if (isPositiveInteger(cId)) {
        isValid = await idInDatabase()
        canReview = await idHasReviewed(cId, id)
        hasBought = await idHasBought(cId, id)
    } else {
        isValid = false
    }

    function isPositiveInteger(str) {
        const num = Number(str);
        return Number.isInteger(num) && num > 0;
    }

    async function idInDatabase() {
        try {
            let pool = await sql.connect(dbConfig);
            let sqlQuery = "SELECT customer.firstName, customer.lastName FROM customer WHERE customer.customerId = @customerId";
            let result = await pool.request().input('customerId', sql.Int(), cId).query(sqlQuery);
            return result.recordset.length !== 0;
        } catch (err) {
            console.dir(err);
            res.end()
        }
    }

    async function idHasBought(custId, prodId) {
        let sqlQuery;
        try {
            if (custId !== 0) {

                let pool = await sql.connect(dbConfig);

                const findOrders = new sql.PreparedStatement(pool)
                sqlQuery = "SELECT * FROM orderSummary JOIN orderProduct ON orderSummary.orderId = orderProduct.orderId WHERE customerId = @customerId AND productId = @productId"


                findOrders.input('customerId', sql.Int)
                findOrders.input('productId', sql.Int)

                await findOrders.prepare(sqlQuery)

                let results = await findOrders.execute({
                    customerId: custId,
                    productId: prodId
                })

                let orders = results.recordset

                if (orders[0])
                    return true
                else
                    return false
            } else {
                return false
            }

        } catch (err) {
            console.dir(err);
            res.end()
        }
    }

    async function idHasReviewed(custId, prodId) {
        let sqlQuery;
        try {
            if (custId !== 0) {

                let pool = await sql.connect(dbConfig);

                const findReviews = new sql.PreparedStatement(pool)
                sqlQuery = "SELECT * FROM review WHERE customerId = @customerId AND productId = @productId"


                findReviews.input('customerId', sql.Int)
                findReviews.input('productId', sql.Int)

                await findReviews.prepare(sqlQuery)

                let results = await findReviews.execute({
                    customerId: custId,
                    productId: prodId
                })

                let reviews = results.recordset

                if (reviews[0])
                    return false
                else
                    return true
            } else {
                return false
            }

        } catch (err) {
            console.dir(err);
            res.end()
        }
    }

    await (async function () {
        let pool = false
        let sqlQuery;
        try {
            pool = await sql.connect(dbConfig)

            const ps = new sql.PreparedStatement(pool)
            ps.input('param', sql.VarChar(40))
            await ps.prepare("SELECT product.productId, product.productName, product.productPrice, product.productDesc, productImageURL, productImage  FROM product WHERE product.productId = @param")
            let result = await ps.execute({param: id})
            let product = result.recordset

            const psReviews = new sql.PreparedStatement(pool)
            psReviews.input('param', sql.VarChar(40))
            await psReviews.prepare("SELECT review.reviewId, review.reviewRating, review.reviewDate, review.customerId, review.productId, review.reviewComment, customer.firstName, customer.lastName FROM review JOIN customer ON review.customerId = customer.customerId WHERE review.productId = @param")
            let reviewsResult = await psReviews.execute({param: id})
            let reviews = reviewsResult.recordset

            if (isValid && canReview && hasBought && cId !== 0) {

                const addReview = new sql.PreparedStatement(pool)
                sqlQuery = "INSERT INTO review (reviewRating, reviewDate, customerId, productId, reviewComment) VALUES (@reviewRating, @reviewDate, @customerId, @productId, @reviewComment)"

                addReview.input('reviewRating', sql.Int)
                addReview.input('reviewDate', sql.DATETIME)
                addReview.input('customerId', sql.Int)
                addReview.input('productId', sql.Int)
                addReview.input('reviewComment', sql.VarChar(1000))

                await addReview.prepare(sqlQuery)

                await addReview.execute({
                    reviewRating: rating,
                    reviewDate: new Date(),
                    customerId: cId,
                    productId: id,
                    reviewComment: comment
                })
            }
        } catch (err) {
            console.dir(err)
            res.end()
        } finally {
            pool.close()
            req.session.isValid = isValid
            req.session.canReview = canReview
            req.session.hasBought = hasBought;

            res.redirect("/product?id=" + id)
        }
    })()
})

module.exports = router
