const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

router.get('/', function (req, res) {

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
        let pool = false
        try {
            pool = await sql.connect(dbConfig)
            let sqlQuery = "SELECT * FROM ordersummary WHERE orderId = @orderId;";
            let result = await pool.request().input('orderId', sql.Int(), orderId).query(sqlQuery);
            return result.recordset.length !== 0;
        } catch (err) {
            console.dir(err);
            // res.write(JSON.stringify(err));
        } finally {
            pool.close();
        }
    }

    let message;
    const orderedProductInfo = [];

    (async function () {
        if (isPositiveInteger(orderId) && await orderIdInDatabase()) {
            let pool = new sql.ConnectionPool(dbConfig)

            await pool.connect()
            try {
                const transaction = new sql.Transaction(pool)
                // starting transaction
                await transaction.begin()
                // retrieving all items in order with  given id
                let getOrderProducts = "SELECT orderproduct.productId, orderproduct.quantity FROM orderproduct WHERE orderproduct.orderId = @orderId;"

                const ps = new sql.PreparedStatement(transaction)

                ps.input('orderId', sql.Int())
                await ps.prepare(getOrderProducts)
                let results = await ps.execute({orderId: orderId})
                let orderProducts = results.recordset;
                await ps.unprepare()

                // creating new shipment record
                let createShipment = "INSERT INTO shipment (shipmentDate, warehouseId) VALUES (@todaysDate, 1);";
                await transaction.request().input('todaysDate', sql.DateTime, moment().format('Y-MM-DD HH:mm:ss')).query(createShipment);

                // Verifying that there is sufficient quantity available in warehouse 1 for each item
                // Cancelling transaction and rolling back if any item does not have sufficient inventory, updating inventory otherwise
                let getQuantityInWarehouse = "SELECT productinventory.quantity FROM productinventory WHERE productinventory.productId = @productId AND productinventory.warehouseId = 1";
                let updateInventory = "UPDATE productinventory SET productinventory.quantity = @newQty WHERE productinventory.productId = @productId AND productinventory.warehouseId = 1"
                for (let i = 0; i < orderProducts.length; i++) {
                    let orderProduct = orderProducts[i];
                    if (!orderProduct) {
                        continue
                    }

                    let results2 = await transaction.request().input('productId', sql.Int(), orderProduct.productId).query(getQuantityInWarehouse);
                    let quantityInWarehouse = 0;
                    if (results2.recordset.length !== 0) {
                        quantityInWarehouse = results2.recordset[0].quantity;
                    }

                    if (quantityInWarehouse < orderProduct.quantity) {
                        await transaction.rollback();
                        message = "Shipment not done. Insufficient inventory for product id: " + orderProduct.productId;
                        renderPage()
                        return;
                    }

                    let newQty = quantityInWarehouse - orderProduct.quantity;
                    await transaction.request().input('newQty', sql.Int(), newQty).input('productId', sql.Int(), orderProduct.productId).query(updateInventory);
                    orderedProductInfo.push("Ordered product: " + orderProduct.productId + " Qty: " + orderProduct.quantity + " Previous inventory: " + quantityInWarehouse + " New inventory: " + newQty);
                }
                await transaction.commit();
                message = "Shipment successfully processed.";
                renderPage()
            } catch (err) {
                await transaction.rollback()
                console.dir(err)
                renderPage()
            } finally {
                pool.close()
            }
        } else {
            message = "Invalid order id";
            renderPage()
        }
    })();


    function renderPage() {
        res.render('ship', {
            orderedProductInfo: orderedProductInfo,
            message: message,
            title: "OnlyDucks Shipment"
        })
    }

});

module.exports = router;
