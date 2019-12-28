const mysql = require('mysql');
const { check, validationResult } = require('express-validator');

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
        const sqlScript = "INSERT INTO users(users_first_name, users_last_name, users_role, users_email, users_password, users_organization_id) VALUES(?, ?, ?, ?, ?, ?)";
        dbConn.query(sqlScript, 
            [users_first_name,
            users_last_name,
            users_role, 
            users_email, 
            users_password, 
            users_organization_id], (err, results) => {
                if (err) {
                    res.send("An error occurred", + err);
                } else {
                    res.send({"status": 200, "error": null, "response": results});
                }
        })
      }
    })

}

module.exports = usersRouter;