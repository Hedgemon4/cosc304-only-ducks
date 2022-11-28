const express = require('express');
const router = express.Router();

// Rendering the main page
router.get('/', function (req, res) {
    res.render('index', {
        title: "OnlyDucks Homepage"
    })
})

module.exports = router;
