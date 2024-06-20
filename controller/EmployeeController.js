const EmployeeController = {
    getEmployeeAndManagerDetails: async (req, employeeId) => {
        return new Promise((resolve, reject) => {
            req.db.query(`
                SELECT e1.*, e2.employee_name as manager_name, e2.employee_designation as manager_designation
                FROM employee_master e1
                LEFT JOIN employee_master e2 ON e1.reporting_to = e2.employee_id
                WHERE e1.employee_id = ?`, [employeeId], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
    },

    getEmployeeDetails: async (req, res) => {
        const employeeId = req.params.employeeId;

        try {
            const results = await EmployeeController.getEmployeeAndManagerDetails(req, employeeId);
            if (results.length === 0) {
                return res.status(404).json({ error: "Employee not found" });
            }
            const employeeDetails = results[0];
            return res.status(200).json(employeeDetails);
        } catch (err) {
            return res.status(500).json({ error: "Internal server error" });
        }
    },

};

module.exports = EmployeeController;
