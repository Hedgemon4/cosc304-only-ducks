const express = require('express');
const router = express.Router();
const sql = require('mssql');
const fs = require('fs');

router.get('/', function(req, res, next) {
    (async function() {
        let pool = false;
        try {
            pool = await sql.connect(dbConfig);

            res.setHeader('Content-Type', 'text/html');
            res.write('<title>Data Loader</title>');
            res.write('<h1>Connecting to database.</h1><p>');

            let data = fs.readFileSync("./data/data.ddl", { encoding: 'utf8' });
            let commands = data.split(";");
            for (let i = 0; i < commands.length; i++) {
                let command = commands[i];
                let result = await pool.request()
                    .query(command);
                res.write('<p>' + JSON.stringify(result) + '</p>')
            }

            res.write('"<h2>Database loading complete!</h2>')
            res.end()
        } catch(err) {
            console.dir(err);
            res.send(err)
        } finally {
            pool.close()
        }
    })();
});

module.exports = router;
