const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

router.get('/', function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');

    let orderId = "";
    if (req.query.orderId) orderId = req.query.orderId;

    // TODO: Check if valid order id
    function isPositiveInteger(str) {
        if (typeof str !== 'string') {
            return false;
        }
        const num = Number(str);
        return Number.isInteger(num) && num > 0;
    }

    async function orderIdInDatabase() {
        try {
            let pool = await sql.connect(dbConfig);
            let sqlQuery = "SELECT * FROM ordersummary WHERE orderId = @orderId;";
            let result = await pool.request().input('orderId', sql.Int(), orderId).query(sqlQuery);
            return result.recordset.length !== 0;
        } catch (err) {
            console.dir(err);
            res.write(JSON.stringify(err));
            res.end();
        }
    }

    (async function () {
        if (isPositiveInteger(customerId) && await orderIdInDatabase()) {
            try {
                /*
                // TODO: Start a transaction
                let pool = await sql.connect(dbConfig);
                const transaction = new sql.Transaction(pool);
                transaction.begin(err => {
                    // ... error checks
                    // TODO: Retrieve all items in order with given id
                    // TODO: Create a new shipment record.
                    // TODO: For each item verify sufficient quantity available in warehouse 1.
                    // TODO: If any item does not have sufficient inventory, cancel transaction and rollback. Otherwise, update inventory for each item.

                    let rolledBack = false

                    transaction.on('rollback', aborted => {
                        // emitted with aborted === true

                        rolledBack = true
                    })

                    new sql.Request(transaction)
                        .query('', (err, result) => {
                            // insert should fail because of invalid value

                            if (err) {
                                if (!rolledBack) {
                                    transaction.rollback(err => {
                                        // ... error checks
                                    })
                                }
                            } else {
                                transaction.commit(err => {
                                    // ... error checks
                                })
                            }
                        })
                })
                 */
                res.write("Hi");
            } catch (err) {
                console.dir(err);
                res.write(err + "")
                res.end();
            }
        }
        res.write("Hello");
        res.end();
    })();
});

module.exports = router;
