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
        const partyId = parseInt(req.params.party_id, 10);
        const query = "SELECT * FROM party_master WHERE party_id = ?";
    
        db.query(query, [partyId], (err, results) => {
            if (err) {
                console.error("Error executing query:", err);
                res.status(500).json({ error: "Database query error" });
                return;
            }
    
            if (results.length > 0) {
                res.json(results[0]);
            } else {
                res.status(404).json({ error: "Warehouse not found" });
            }
        });
    },
}

module.exports = warehouseListController;