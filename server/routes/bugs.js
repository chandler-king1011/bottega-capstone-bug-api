const mysql = require('mysql');
const db = require('../db');
const verify = require("./verifyToken");

dbConn = mysql.createPool(db);


function bugsRouter(app) {

    //Get all bugs for org.
    app.get("/bugs/organization/:id", verify, (req, res) => {
        dbConn.query(`
        SELECT b.*, u.users_first_name, u.users_last_name, u.users_role
        FROM bugs b
        JOIN users u
        ON u.users_id= b.bugs_assigned_id
        WHERE bugs_organization_id = ?`, [req.params.id], (err, results) => {
            if (err) {
                res.send("Failed to retrieve bugs from the database." + err);
            }
            else {
                res.send(results);
          }
        });
    });

    //Get one bug with bug id.
    app.get("/bug/:id", verify, (req, res) => {
        dbConn.query(`
        SELECT b.*, u.users_first_name, u.users_last_name, u.users_role
        FROM bugs b
        JOIN users u
        ON u.users_id= b.bugs_assigned_id
        WHERE bugs_id = ?`, [req.params.id], (err, results) => {
            if (err) {
                res.send("An error occurred" + err);
            } else {
                res.send(results);
        }
        });
    });

    //Get bugs assigned to a specific user. 

    app.get("/bugs/user/:id", verify, (req, res) => {
        dbConn.query(`
        SELECT b.*, u.users_first_name, u.users_last_name, u.users_role
        FROM bugs b
        JOIN users u
        ON u.users_id= b.bugs_assigned_id
        WHERE bugs_assigned_id = ?`, [req.params.id], (err, results) => {
            if (err) {
                res.send("An error occurred" + err);
            } else {
                res.send(results);
            } 
        });
    });

    app.post("/bugs", verify, (req, res) => {
        let bugData = {
            bugs_title: req.body.bugs_title, 
            bugs_image_one: req.body.bugs_image_one, 
            bugs_image_two: req.body.bugs_image_two,
            bugs_image_three: req.body.bugs_image_three,
            bugs_image_four: req.body.bugs_image_four,
            bugs_status: req.body.bugs_status,
            bugs_severity: req.body.bugs_severity,
            bugs_replicable: req.body.bugs_replicable,
            bugs_created_date: req.body.bugs_created_date,
            bugs_assigned_id: req.body.bugs_assigned_id,
            bugs_description: req.body.bugs_description,
            bugs_organization_id: req.body.bugs_organization_id
        };
        let sqlScript = "INSERT INTO bugs SET ?";
        dbConn.query(sqlScript, bugData, (err, results) => {
            if (err) {
                res.send("An error occurred" + err);
            } else {
                res.send({"status": 200, "error": null, "response": results})
            }
        })
    });

    app.put('/bug/:id', verify, (req, res) => {
        let bugData = req.body;
        let sqlScript = "UPDATE bugs SET ? WHERE bugs_id = ?";

        dbConn.query(sqlScript, [bugData, req.params.id], (err, results) => {
            if (err) {
                res.send("An error occurred" + err);
            } else {
                res.send({"status": 200, "error": null, "response": results})
            }
        })
    });


    app.delete('/bug/:id', verify, (req, res) => {
        let sqlScript = "DELETE FROM bugs WHERE bugs_id = ?";

        dbConn.query(sqlScript, [req.params.id], (err, results) => {
            if (err) {
                res.send("An error occurred" + err);
            } else {
                res.send({"status": 200, "error": null, "response": results});
            }
        })

    })

}





module.exports = bugsRouter;
