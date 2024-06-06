const db = require("../config/db");

const warehouseListController = {

    getWarehouseList : (req, res) => {

        db.query('SELECT * FROM party_master', (err, warehouses) => {
            if (!err) {
                res.render('warehouselist', { warehouses });
            } else {
                console.log(err);
            }
        });

    },
}

module.exports = warehouseListController;