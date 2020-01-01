const mysql = require('mysql');
const db = require('../db');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');


const saltRounds = 10;
dbConn = mysql.createConnection(db);

function organizationRouter(app) {
    
    app.post("/organization/register", [
        check('organization_name', 'Organization name cannot be empty.').notEmpty(),
        check('organization_name', 'Organization name must be between 4-45 characters long').isLength({min: 4, max: 45}),
        check('organization_password', 'Password must be between 8-100 characters long').isLength({min: 8, max: 100}),
        check('organization_password', 'Password must contain one lowercase, one uppercase, a number, and a special character.')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i"),
        check('organization_creator_id', 'Creator ID cannot be empty.').notEmpty()
    ], async (req, res) => {
        const validationErrors = validationResult(req);

        if(!validationErrors.isEmpty()) {
            res.send({"title": "Invalid Input", "errors": validationErrors});
        } else {
            const organization_password = req.body.organization_password;
            bcrypt.hash(organization_password, saltRounds, async (err, hash) => {
                const {organization_name, organization_creator_id} = req.body;
                const sqlScript = "INSERT INTO organization(organization_name, organization_password, organization_creator_id) VALUES(?, ?, ?)";
                const organizationData = [organization_name, hash, organization_creator_id];
                dbConn.query(sqlScript, organizationData, (err, results) => {
                    if (err) {
                        res.send({"status": 400, "message": err })
                    } else {
                        dbConn.query("SELECT LAST_INSERT_ID() as orgID FROM organization", (err, results) => {
                            if(err) {
                                res.send({"status": 400, "message": err })
                            } else {
                                const userUpdateScript = "UPDATE users SET ? WHERE users_id = ?";
                                const userUpdateData = {
                                    users_role: "Admin",
                                    users_organization_id: results[0].orgID
                                };

                                dbConn.query(userUpdateScript, [userUpdateData, organization_creator_id], (err, results) => {
                                    if (err){
                                        res.send({"status": 400, "message": results});
                                    } else {
                                        res.send({"status": 200, "message": results});
                                    }
                                })
                            }
                        })
                    }
                })
            })
        }
    });



}

module.exports = organizationRouter;
