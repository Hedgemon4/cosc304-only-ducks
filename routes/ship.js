const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

router.get('/', async function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');

    let orderId = "";
    if (req.query.orderId) orderId = req.query.orderId;

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
            pool.close();
            return result.recordset.length !== 0;
        } catch (err) {
            console.dir(err);
            res.write(JSON.stringify(err));
            res.end();
        }
    }

    if (isPositiveInteger(orderId) && await orderIdInDatabase()) {
        res.write("Yup");
    } else {
        res.write("Nope");
    }

    await (async function () {
        if (isPositiveInteger(orderId) && await orderIdInDatabase()) {
            try {
                let pool = await sql.connect(dbConfig);
                let todaysDate = (new Date()).toISOString();
                const transaction = new sql.Transaction(pool);
                try {
                    // TODO: Start a transaction
                    await transaction.begin();

                    // TODO: Retrieve all items in order with given id
                    let getOrderProducts = "SELECT orderproduct.productId, orderproduct.quantity FROM orderproduct WHERE orderproduct.orderId = @orderId;\""
                    let results = await pool.request().input('orderId', sql.Int(), orderId).query(getOrderProducts);
                    let products = results.recordset;
                    console.log(products);

                    // TODO: Create a new shipment record.
                    let createShipment = "INSERT INTO shipment (shipmentDate, warehouseId) VALUES ('@todaysDate', 1);";
                    await pool.request().input('todaysDate', sql.Date(), todaysDate).query(createShipment);

                    let results2 = await pool.request().query("SELECT * FROM shipment;");
                    let shipments = results2.recordset;
                    console.log(shipments);

                    // TODO: For each item verify sufficient quantity available in warehouse 1.
                    // "SELECT * FROM productinventory;"
                    // TODO: If any item does not have sufficient inventory, cancel transaction and rollback. Otherwise, update inventory for each item.

                    await transaction.commit();
                } catch (err) {
                    await transaction.rollback();
                    throw err;
                } finally {
                    await pool.close();
                }
            } catch (err) {
                console.dir(err);
                res.write(err + "")
                res.end();
            }
        }
    })();

    res.write("Hello");
    res.end();
});

module.exports = router;
