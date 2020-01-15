const mysql = require('mysql');
const db = require('../db');
const verify = require("./verifyToken");

dbConn = mysql.createPool(db);


function commentsRouter(app) {
    //get comments 
    app.get("/comments/bug/:id", verify, (req, res) => {
        dbConn.query(`
        SELECT c.*, u.users_first_name, u.users_last_name, u.users_role
        FROM comments c
        JOIN users u
        ON u.users_id = c.comments_users_id
        WHERE comments_bugs_id = ?`, [req.params.id], (err, results) => {
            if (err) {
                res.send("An error occurred." + err);
            } else{
                res.send(results);
            }
        });
    });

    //get a specific comment
    app.get("/comment/:id", verify, (req, res) => {
        dbConn.query(`
        SELECT c.*, u.users_first_name, u.users_last_name, u.users_role
        FROM comments c
        JOIN users u
        ON u.users_id = c.comments_users_id
        WHERE comments_id = ?`, [req.params.id], (err, results) => {
            if (err) {
                res.send("An error occurred." + err);
            } else {
                res.send(results);
            }
        })
    })

    //get comments from a specific user 

    app.get("/comments/user/:id", verify, (req, res) => {
        dbConn.query("SELECT * FROM comments WHERE comments_users_id = ?", [req.params.id], (err, results) => {
            if (err) {
                res.send("An error occurred" + err);
            } else {
                res.send(results);
            }
        })
    })

    //creating a comment 

    app.post("/comments", verify, (req, res) => {
        let commentData = {
            comments_users_id : req.body.comments_users_id,
            comments_bugs_id : req.body.comments_bugs_id,
            comments_text : req.body.comments_text,
            comments_created_date : req.body.comments_created_date
        }
        let sqlScript = "INSERT INTO comments SET ?";
        dbConn.query(sqlScript, commentData, (err, results) => {
            if (err) {
                res.send("An error occurred posting your comment" + err);
            } else {
                res.send({"status": 200, "error": null, "response": results});
            }
        })
    })

    //Updating a comment 

    app.put("/comment/:id", verify, (req, res) => {
        let commentData = {
            comments_users_id : req.body.comments_users_id,
            comments_bugs_id : req.body.comments_bugs_id,
            comments_text : req.body.comments_text,
            comments_created_date : req.body.comments_created_date
        }
        let sqlScript = "UPDATE comments SET ? WHERE comments_id = ?";

        dbConn.query(sqlScript, [commentData, req.params.id], (err, results) => {
            if (err) {
                res.send("An error occurred while updating the comment." + err);
            } else {
                res.send({"status": 200, "error": null, "response": results});
            }
        })
    })

    //Deleting a comment 
 
    app.delete("/comment/:id", verify, (req, res) => {
        dbConn.query("DELETE FROM comments WHERE comments_id = ?", [req.params.id], (err, results) => {
            if (err) {
                res.send("An error occurred when deleting the bug." + err);
            } else {
                res.send({"status": 200, "error": null, "response": results})
            }
        })
    })
}

module.exports = commentsRouter;