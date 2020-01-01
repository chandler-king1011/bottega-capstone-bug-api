const mysql = require('mysql');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const verify = require("./verifyToken");

require('dotenv').config();

const saltRounds = 10;

const db = require('../db');
dbConn = mysql.createConnection(db);

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

        dbConn.query("SELECT users_password, users_id, users_first_name, users_last_name, users_role FROM users WHERE users_email = ?",
        [email], (err, results) => {
            if (err) {
                res.send({"status": 400, "message": "Email or Password is invalid", "error": err});
            } else {
                bcrypt.compare(password, results[0].users_password, (error, resolve) => {
                    if (resolve === true) {
                        const token = jwt.sign({id: results[0].users_id}, process.env.TOKEN_SECRET);
                        res.header("auth-token", token);
                        res.send({"status": 200, "message": "success"});
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
            res.send({"title": "Invalid Input", "errors": validationErrors});
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
                        res.send({"status": 400, "message": err });
                    } else {
                        res.send({"status": 200, "message": results});
                    }
                })
            })
        }
    });


    app.put("/users/update/:id", 
    [        
        check('users_first_name', 'Users Name field cannot be empty.').notEmpty(),
        check('users_last_name', 'Users Name field cannot be empty.').notEmpty(),
        check('users_email', 'Users email field cannot be empty.').notEmpty(),
        check('users_email', 'Email address must be between 4-100 characters long').isLength({min: 4, max: 100}),
        check('users_email', 'The email you entered was invalid. Please try again.').isEmail(),
        check('users_password', 'Password must be between 8-100 characters long').isLength({min: 8, max: 100}),
        check('users_password', 'Password must contain one lowercase, one uppercase, a number, and a special character.')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
    ], (req, res) => {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            res.send({"title": "Invalid Input", "errors": validationErrors});
        } else {
            let {users_first_name, users_last_name, users_role, users_email, users_organization_id} = req.body;
            let users_password = req.body.users_password;
            bcrypt.hash(users_password, saltRounds, (err, hash) => {
                let sqlScript = "UPDATE users SET ? WHERE users_id = ?";
                let userData = {
                    users_first_name: users_first_name,
                    users_last_name: users_last_name,
                    users_role: users_role,
                    users_email: users_email,
                    users_organization_id: users_organization_id,
                    users_password: hash
                };
                dbConn.query(sqlScript, [userData, req.params.id], (err, results) => {
                    if (err) {
                        res.send({"status": 400, message: err });
                    } else {
                        res.send({"status": 200, message: results});
                    }
                })
            })
        }
    });




}


module.exports = usersRouter;