const mysql = require('mysql');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const verify = require("./verifyToken");


require('dotenv').config();

const saltRounds = 10;

const db = require('../db');
dbConn = mysql.createPool(db);

function usersRouter(app) {
    app.get("/users/organization/:id", verify, (req, res) => {
        let sqlScript = "SELECT users_first_name, users_last_name, users_role FROM users WHERE users_organization_id = ?";
        dbConn.query(sqlScript, [req.params.id], (err, results)=> {
            if (err) {
                res.send("An error occurred." + err);
            } else {
                res.send(results);
            }
        })
    })

    // Login

    app.post('/users/login',         
    [
      check('email', 'Users email field cannot be empty.').notEmpty(),
      check('email', 'The email you entered was invalid. Please try again.').isEmail()
    ], (req, res) => {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            res.send({"title": "Invalid Input", "errors": validationErrors});
        } else {
        const email = req.body.email;
        const password = req.body.password;

        dbConn.query("SELECT users_password, users_organization_id, users_email, users_id, users_first_name, users_last_name, users_role FROM users WHERE users_email = ?",
        [email], (err, results) => {
            if (err) {
                res.send({"status": 400, "message": "Email or Password is invalid", "error": err});
            } else {
                bcrypt.compare(password, results[0].users_password, (error, resolve) => {
                    if (resolve === true) {
                        const token = jwt.sign({id: results[0].users_id}, process.env.TOKEN_SECRET);
                        res.header("auth-token", token)
                        .send({"status": 200, "message": "success", "results": {
                            users_first_name: results[0].users_first_name,
                            users_last_name: results[0].users_last_name,
                            users_role: results[0].users_role,
                            users_id: results[0].users_id,
                            users_email: results[0].users_email,
                            users_organization_id: results[0].users_organization_id
                        }, "token": token});
                        
                    }
                    if (resolve === false) {
                        res.send({"status": 400, "message": "Invalid Password"})
                    }
                });
            }
        })
      }
    });

    // registering a user
    app.post("/users/register", [        
        check('users_first_name', 'Users Name field cannot be empty.').notEmpty(),
        check('users_last_name', 'Users Name field cannot be empty.').notEmpty(),
        check('users_email', 'Users email field cannot be empty.').notEmpty(),
        check('users_email', 'Email address must be between 4-100 characters long').isLength({min: 4, max: 100}),
        check('users_email', 'The email you entered was invalid. Please try again.').isEmail(),
        check('users_password', 'Password must be between 8-100 characters long').isLength({min: 8, max: 100}),
        check('users_password', 'Password must contain one lowercase, one uppercase, a number, and a special character.')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i")],
         (req, res) => {


        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            res.send({"status": 400, "title": "Invalid Input", "errors": validationErrors});
        } else {

        let {users_first_name, users_last_name, users_role, users_email, users_organization_id} = req.body;
        let users_password = req.body.users_password;
        bcrypt.hash(users_password, saltRounds, (err, hash) => {
            const sqlScript = "INSERT INTO users(users_first_name, users_last_name, users_role, users_email, users_password, users_organization_id) VALUES(?, ?, ?, ?, ?, ?)";
            dbConn.query(sqlScript, 
                [users_first_name,
                users_last_name,
                users_role, 
                users_email, 
                hash, 
                users_organization_id], (err, results) => {
                    if (err) {
                        res.send({"title": "Duplicate Email", "status": 400, "message": err });
                    } else {
                        res.send({"status": 200, "message": results});
                    }
                })
            })
        }
    });



    app.put("/users/update-password/:id", verify, 
    [
        check('newPassword', 'Password must be between 8-100 characters long').isLength({min: 8, max: 100}),
        check('newPassword', 'Password must contain one lowercase, one uppercase, a number, and a special character.')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
    ], (req, res) => {

        const validationErrors = validationResult(req);
        const newPassword = req.body.newPassword;
        const currentPassword = req.body.currentPassword;

        if (!validationErrors.isEmpty()) {
            res.send({"status": 400, "message": "Invalid Input", "errors": validationErrors});
        } else {
            dbConn.query("SELECT users_password FROM users WHERE users_id = ?",
            [req.params.id], (err, results) => {
                if (err) {
                    res.send({"status": 400, "message": "ID or Password is invalid", "error": err});
                } else {
                    bcrypt.compare(currentPassword, results[0].users_password, (error, resolve) => {
                        if (resolve === true) {
                            bcrypt.hash(newPassword, saltRounds, (err, hash) => {
                                dbConn.query("UPDATE users SET ? WHERE users_id = ?", [{users_password: hash}, req.params.id], (err, results) => {
                                    if (err) {
                                        res.send({"status": 400, "message": "Error updating password.", "error": err});
                                    } else {
                                        res.send({"status": 200, "message": "Password was updated successfully", "results": results})
                                    }
                                })

                            })
                        } else if(error) {
                            res.send({"status": 400, "message": "Current Password is invalid", "error": err});
                        } if (resolve === false) {
                            res.send({"status": 400, "message": "Current Password is invalid", "error": err});
                        }
                    })
                }
            })
        }
    })





    app.put("/users/update/:id", 
    [        
        check('users_first_name', 'Users Name field cannot be empty.').notEmpty(),
        check('users_last_name', 'Users Name field cannot be empty.').notEmpty(),
        check('users_email', 'Users email field cannot be empty.').notEmpty(),
        check('users_email', 'Email address must be between 4-100 characters long').isLength({min: 4, max: 100}),
        check('users_email', 'The email you entered was invalid. Please try again.').isEmail()
    ], (req, res) => {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            res.send({"status": 400, "title": "Invalid Input", "errors": validationErrors});
        } else {
            let {users_first_name, users_last_name, users_role, users_email, users_organization_id} = req.body;
                let sqlScript = "UPDATE users SET ? WHERE users_id = ?";
                let userData = {
                    users_first_name: users_first_name,
                    users_last_name: users_last_name,
                    users_role: users_role,
                    users_email: users_email,
                    users_organization_id: users_organization_id,
                };
                dbConn.query(sqlScript, [userData, req.params.id], (err, results) => {
                    if (err) {
                        res.send({"status": 400, "message": err });
                    } else {
                        dbConn.query("SELECT users_organization_id, users_email, users_id, users_first_name, users_last_name, users_role FROM users WHERE users_id = ?", 
                        [req.params.id], (err, results) => {
                            if (err) {
                                res.send({"status": 400, "message": err });
                            } else {res.send({"status": 200, "message": results});}
                        })
                    }
                })
            }
       });


    app.put("/users/leave-org/:id", verify, (req, res) => {
        const userId = req.params.id;
        const updateData = {
            users_organization_id: null,
            users_role: "Tester"
        }
        dbConn.query("UPDATE users SET ? WHERE users_id = ?", [updateData, userId],
        (err, results) => {
            if (err) {
                res.send({"status": 400, "message": results, "error": err});
            } else {
                dbConn.query("SELECT * FROM users WHERE users_id = ?", [userId], (error, result) => {
                    res.send({"status": 200, "results": {
                        users_first_name: result[0].users_first_name,
                        users_last_name: result[0].users_last_name,
                        users_role: result[0].users_role,
                        users_id: result[0].users_id,
                        users_email: result[0].users_email,
                        users_organization_id: result[0].users_organization_id
                    }});
                })

            }
        })
    });


}


module.exports = usersRouter;