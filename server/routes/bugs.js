const mysql = require('mysql');
const db = require('../db');
const verify = require("./verifyToken");
const cloudinary = require('cloudinary').v2;



dbConn = mysql.createPool(db);
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})





function bugsRouter(app) {

    //Get all bugs for org.
    app.get("/bugs/organization/:id", verify, (req, res) => {
        dbConn.query(`
        SELECT b.*, u.users_first_name, u.users_last_name, u.users_role
        FROM bugs b
        JOIN users u
        ON u.users_id= b.bugs_assigned_id
        WHERE bugs_organization_id = ? 
        `, [req.params.id], (err, results) => {
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

    //get bugs with a query.

    app.post("/search/organization-bugs/:id", verify, (req, res) => {
        dbConn.query(
            `SELECT * FROM bugs WHERE bugs_description OR bugs_title LIKE "%${req.body.query}%" AND bugs_organization_id = ?`,
             [req.params.id], (err, results) => {
                if (err) {
                    res.send("An error occurred" + err);
                } else {
                    res.send(results)
                }
            })
    })

    app.post("/search/user-bugs/:id", verify, (req, res) => {
        dbConn.query(
            `SELECT * FROM bugs WHERE bugs_description OR bugs_title LIKE "%${req.body.query}%" AND bugs_assigned_id = ?`,
             [req.params.id], (err, results) => {
                if (err) {
                    res.send("An error occurred" + err);
                } else {
                    res.send(results)
                }
            })
    })



    app.post("/bugs", verify, (req, res) => {
        console.log(req);
        var bugData = {
            bugs_title: req.body.bugs_title, 
            bugs_image_one: null,
            bugs_image_two: null,
            bugs_status: req.body.bugs_status,
            bugs_severity: req.body.bugs_severity,
            bugs_replicable: req.body.bugs_replicable,
            bugs_created_date: req.body.bugs_created_date,
            bugs_assigned_id: req.body.bugs_assigned_id,
            bugs_description: req.body.bugs_description,
            bugs_organization_id: req.body.bugs_organization_id
        };


    if (req.files === null) {
        dbConn.query("INSERT INTO bugs SET ?", bugData, (err, results) => {
            if (err) {
                res.send("An error occurred" + err);
            } else {
                res.send({"status": 200, "error": null, "response": results})
            }
        })
    } else {
                    const imageOne = new Promise((resolve, reject) => {
                        if (req.files.bugs_image_one != null) {
                        cloudinary.uploader.upload(req.files.bugs_image_one.tempFilePath, function (error, result) {
                        if (error) {reject(bugData);}
                        else {
                            bugData.bugs_image_one = result.secure_url
                            resolve(bugData);
                        } 
                        
                    })
                } else{ resolve(bugData);}
            })

            const imageTwo = new Promise((resolve, reject) => {
                if (req.files.bugs_image_two != null) {
                cloudinary.uploader.upload(req.files.bugs_image_two.tempFilePath, function (error, result) {
                    if (error) {reject(bugData);} else {
                    bugData.bugs_image_two = result.secure_url
                    resolve(bugData);
                }
                })
            } else{resolve(bugData);}
            })

        Promise.all([imageOne, imageTwo])
        .then(values => {
            dbConn.query("INSERT INTO bugs SET ?", bugData, (err, results) => {
                if (err) {
                    res.send("An error occurred" + err);
                } else {
                    res.send({"status": 200, "error": null, "response": results})
                }
            })
        })
        .catch(error => {
            res.send({"error": error, "status": 400});
        })
      }
    });



    app.put("/bug/:id", verify, (req, res) => {
        let bugData = req.body;
        let sqlScript = `UPDATE bugs SET ? WHERE bugs_id = ?`;

        dbConn.query(sqlScript, [bugData, req.params.id], (err, results) => {
            if (err) {
                res.send("An error occurred" + err);
            } else {
                res.send({"status": 200, "error": null, "response": results})
            }
        })
    });


    app.delete("/bug/:id", verify, (req, res) => {
        let sqlScript = `DELETE FROM bugs WHERE bugs_id = ?`;

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
