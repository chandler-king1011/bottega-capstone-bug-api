const mysql = require('mysql');
const db = require('../db');

dbConn = mysql.createConnection(db);

function usersRouter(app) {

    app.get("/users/organization/:id", (req, res) => {
        let sqlScript = "SELECT users_first_name, users_last_name, users_role FROM users WHERE users_organization_id = ?";
        dbConn.query(sqlScript, [req.params.id], (err, results)=> {
            if (err) {
                res.send("An error occurred." + err);
            } else {
                res.send(results);
            }
        })
    })

}

module.exports = usersRouter;