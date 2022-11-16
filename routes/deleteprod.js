const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
    let id = false;
    if (req.query.id) {
        id = req.query.id;
    }
    res.setHeader('Content-Type', 'text/html');
    res.write('<h1>delete</h1>')
    res.redirect("/showcart");
});

module.exports = router;