const mysql = require('mysql');
const db = require('../db');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const verify = require("./verifyToken");


const saltRounds = 10;
dbConn = mysql.createPool(db);

function organizationRouter(app) {
    app.get("/organization/:id", verify, (req, res) => {
        const orgId = req.params.id;
        dbConn.query("SELECT organization_name as 'organizationName' FROM organization WHERE organization_id = ?",
        [orgId], (err, results) => {
            if (err) {
                res.send({"status": 400, "message": results, "error": err})
            } else {
                res.send(results[0]);
            }
        })
    });

    app.get("/organizations", verify, (req, res) => {
        const request = req;
        dbConn.query("SELECT organization_id as ID, organization_name as 'Organization Name' FROM organization", (err, results) => {
            if (err) {
                res.send({"status": 400, "message": results, "error": err})
            } else {
                res.send(results);
            }
        })
    });

    
    app.post("/organization/register", [
        check('organization_name', 'Organization name cannot be empty.').notEmpty(),
        check('organization_name', 'Organization name must be between 4-45 characters long').isLength({min: 4, max: 45}),
        check('organization_password', 'Password must be between 8-100 characters long').isLength({min: 8, max: 100}),
        check('organization_password', 'Password must contain one lowercase, one uppercase, a number, and a special character.')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i"),
        check('organization_creator_id', 'Creator ID cannot be empty.').notEmpty()
    ], (req, res) => {
        const validationErrors = validationResult(req);

        if(!validationErrors.isEmpty()) {
            res.send({"status": 400, "title": "Invalid Input", "errors": validationErrors, "message": "Password must contain one lowercase, one uppercase, a number, and a special character."});
        } else {
            const organization_password = req.body.organization_password;
            bcrypt.hash(organization_password, saltRounds, (err, hash) => {
                const {organization_name, organization_creator_id} = req.body;
                const sqlScript = "INSERT INTO organization(organization_name, organization_password, organization_creator_id) VALUES(?, ?, ?)";
                const organizationData = [organization_name, hash, organization_creator_id];
                dbConn.query(sqlScript, organizationData, (err, results) => {
                    if (err) {
                        res.send({"status": 400, "message": "An error occurred please try again.", "errors": err })
                    } else {
                        dbConn.query("SELECT organization_id as orgID FROM organization WHERE organization_name = ?", [organization_name], (err, results) => {
                            if(err) {
                                res.send({"status": 400, "message": "An error occurred please try again.", "errors": err  })
                            } else {
                                const userUpdateScript = "UPDATE users SET ? WHERE users_id = ?";
                                const userUpdateData = {
                                    users_role: "Admin",
                                    users_organization_id: results[0].orgID
                                };

                                dbConn.query(userUpdateScript, [userUpdateData, organization_creator_id], (err, results) => {
                                    if (err){
                                        res.send({"status": 400, "message": "An error occurred please try again.", "error": err});
                                    } else {
                                        res.send({"status": 200, "results": userUpdateData, "message": results});
                                    }
                                })
                            }
                        })
                    }
                })
            })
        }
    });

    
    app.post("/organization/login", [
        check('organizationName', 'Organization name cannot be empty.').notEmpty(),
        check('organizationName', 'Organization name must be between 4-45 characters long').isLength({min: 4, max: 45}),
        check('password', 'Password must be between 8-100 characters long').isLength({min: 8, max: 100}),
        check('password', 'Password must contain one lowercase, one uppercase, a number, and a special character.')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
    ], (req, res) => {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            res.send({"status": 400, "errors": validationErrors});
        } else {
            const userId = req.body.userId;
            const organizationName = req.body.organizationName;
            const password = req.body.password;

            dbConn.query("SELECT organization_password as hash, organization_id as orgID, organization_name as Name FROM organization WHERE organization_name = ?", 
            [organizationName], (err, results) => {
                if (err) {
                    res.send({"status": 400, "message": "Organization Name, or Password was incorrect"});
                } else {
                    const userUpdateData = {
                        users_organization_id: results[0].orgID
                    };

                    bcrypt.compare(password, results[0].hash, (error, resolve) => {
                        if (resolve === true) {
                            dbConn.query("UPDATE users SET ? WHERE users_id = ?", [userUpdateData, userId], (err, results) => {
                                if (err) {
                                    res.send({"status": 400, "message": results, "error": err});
                                } else {
                                    dbConn.query("SELECT * FROM users WHERE users_id = ?", [userId], (error, result) => {
                                        if (error) {
                                            res.send({"status": 400, "message": results, "error": err});
                                        } else {
                                            res.send({"status": 200, "results": {
                                                users_first_name: result[0].users_first_name,
                                                users_last_name: result[0].users_last_name,
                                                users_role: result[0].users_role,
                                                users_id: result[0].users_id,
                                                users_email: result[0].users_email,
                                                users_organization_id: result[0].users_organization_id
                                            }})
                                        }
                                    })
                                    
                                }
                            })
                        }
                        if (resolve === false) {
                            res.send({"status": 400, "message": "Invalid Password"});
                        }
                    })
                }
            })
        }
    });
    

    app.put("/organization/update/:id", [
        check('organization_name', 'Organization name cannot be empty.').notEmpty(),
        check('organization_name', 'Organization name must be between 4-45 characters long').isLength({min: 4, max: 45}),
        check('organization_password', 'Password must be between 8-100 characters long').isLength({min: 8, max: 100}),
        check('organization_password', 'Password must contain one lowercase, one uppercase, a number, and a special character.')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
    ], (req, res) => {
        const validationErrors = validationResult(req);

        if(!validationErrors.isEmpty()) {
            res.send({"title": "Invalid Input", "errors": validationErrors});
        } else {
            const orgId = req.params.id;
            const organization_password = req.body.organization_password;
            bcrypt.hash(organization_password, saltRounds, (err, hash) => {
                const {organization_name, organization_creator_id} = req.body;
                const sqlScript = "UPDATE organization SET ? WHERE organization_id = ?";
                const organizationData = {
                    organization_name: organization_name,
                    organization_password: hash,
                    organization_creator_id: organization_creator_id
                };

                dbConn.query(sqlScript, [organizationData, orgId], (err, results) => {
                    if (err) {
                        res.send({"status": 400, "message": results, "error": err });
                    } else {
                        res.send({"status": 200, "message": results});
                    }
                })
            })
        }
    });

    


}

module.exports = organizationRouter;
