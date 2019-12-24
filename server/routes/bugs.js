const mysql = require('mysql');
const db = require('../db');

dbConn = mysql.createConnection(db);


function bugsRouter(app) {

    //Get all bugs for org.
    app.get("/organization/bugs/:id", (req, res) => {
        dbConn.query(`SELECT * FROM bugs WHERE bugs_organization_id = ?`, [req.params.id], (err, results) => {
            if (err) {
                res.send("Failed to retrieve bugs from the database." + err);
            }
            else {
            res.send(results);
          }
        });
    });

    //Get one bug with bug id.
    app.get("/bug/:id", (req, res) => {
        dbConn.query("SELECT * FROM bugs WHERE bugs_id = ?", [req.params.id], (err, results) => {
            if (err) {
                res.send("An error occurred" + err);
            } else {
            res.send(results);
        }
        });
    });

    //Get bugs assigned to a specific user. 

    app.get("/user/bugs/:id", (req, res) => {
        dbConn.query("SELECT * FROM bugs WHERE bugs_assigned_id = ?", [req.params.id], (err, results) => {
            if (err) {
                res.send("An error occurred" + err);
            } else {
                res.send(results);
            } 
        });
    });

}





module.exports = bugsRouter;
