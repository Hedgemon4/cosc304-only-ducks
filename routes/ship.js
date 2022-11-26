const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

router.get('/', async function (req, res) {
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

    await (async function () {
        if (isPositiveInteger(orderId) && await orderIdInDatabase()) {
            try {
                let pool = await sql.connect(dbConfig);
                const transaction = new sql.Transaction(pool);
                try {
                    // starting transaction
                    await transaction.begin();

                    // retrieving all items in order with given id
                    let getOrderProducts = "SELECT orderproduct.productId, orderproduct.quantity FROM orderproduct WHERE orderproduct.orderId = @orderId;"
                    let results = await pool.request().input('orderId', sql.Int(), orderId).query(getOrderProducts);
                    let orderProducts = results.recordset;
                    console.log(orderProducts);

                    // creating new shipment record
                    let createShipment = "INSERT INTO shipment (shipmentDate, warehouseId) VALUES (@todaysDate, 1);";
                    await pool.request().input('todaysDate', sql.DateTime, moment().format('Y-MM-DD HH:mm:ss')).query(createShipment);

                    let toBePrinted = await pool.request().query("SELECT * FROM shipment;");
                    let shipments = toBePrinted.recordset;
                    console.log(shipments);

                    // Verifying that there is sufficient quantity available in warehouse 1 for each item
                    // Cancelling transaction and rolling back if any item does not have sufficient inventory, updating inventory otherwise
                    let getQuantityInWarehouse = "SELECT productinventory.quantity FROM productinventory WHERE productinventory.productId = @productId AND productinventory.warehouseId = 1";
                    let updateInventory = "UPDATE productinventory SET productinventory.quantity = @newQty WHERE productinventory.productId = @productId AND productinventory.warehouseId = 1"
                    for (let i = 0; i < orderProducts.length; i++) {
                        let orderProduct = orderProducts[i];
                        if (!orderProduct) {
                            continue
                        }

                        let results2 = await pool.request().input('productId', sql.Int(), orderProduct.productId).query(getQuantityInWarehouse);
                        let quantityInWarehouse = 0;
                        if (results2.recordset.length !== 0) {
                            quantityInWarehouse = results2.recordset[0].quantity;
                        }

                        if (quantityInWarehouse < orderProduct.quantity) {
                            await transaction.rollback();
                            res.write("<h2>Shipment not done. Insufficient inventory for product id: " + orderProduct.productId + "</h2>")
                            return;
                        }

                        let newQty = quantityInWarehouse - orderProduct.quantity;
                        await pool.request().input('newQty', sql.Int(), newQty).input('productId', sql.Int(), orderProduct.productId).query(updateInventory);
                        res.write("<p>Ordered product: " + orderProduct.productId + " Qty: " + orderProduct.quantity + " Previous inventory: " + quantityInWarehouse + " New inventory: " + newQty + "</p>");
                    }
                    await transaction.commit();
                    res.write("<h2>Shipment successfully processed.</h2>")
                } catch (err) {
                    await transaction.rollback();
                } finally {
                    await pool.close();
                }
            } catch (err) {
                console.dir(err);
                res.write(err + "")
                res.end();
            }
        } else {
            res.write("<h2>Invalid order id</h2>")
        }
    })();
    res.end();
});

module.exports = router;
