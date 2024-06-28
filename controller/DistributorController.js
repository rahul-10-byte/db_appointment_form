const db = require("../config/db");

const warehouseListController = {

    getDistributorList : (req, res) => {

        db.query('SELECT * FROM party_master', (err, warehouses) => {
            if (!err) {
                res.render('distributor_list', { warehouses });
            } else {
                console.log(err);
            }
        });

    },

    getDistributorById: (req, res) => {
        const sapCode = req.params.sap_code;
        const query = "SELECT * FROM party_master WHERE sap_code = ?";
    
        console.log(query, sapCode);
        db.query(query, [sapCode], (err, results) => {
            console.log("Results:", results);
            if (err) {
                console.error("Error executing query:", err);
                res.status(500).json({ error: "Database query error" });
                return;
            }
    
            if (results.length > 0) {
                res.json(results[0]);
            } else {
                res.status(404).json({ error: "Distributor not found" });
            }
        });
    },
}

module.exports = warehouseListController;