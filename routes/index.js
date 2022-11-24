const express = require('express');
const router = express.Router();

// Rendering the main page
router.get('/', function (req, res) {
    let username = false;

    res.render('index', {
        title: "OnlyDucks Homepage"
        // HINT: Look at the /views/index.handlebars file
        // to get an idea of how the index page is being rendered
    });
})

module.exports = router;
