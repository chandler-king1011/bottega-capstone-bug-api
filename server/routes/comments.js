const mysql = require('mysql');
const db = require('../db');

dbConn = mysql.createConnection(db);


function commentsRouter(app) {
    //get comments 
    app.get("/bugs/comments/:id", (req, res) => {
        dbConn.query("SELECT * FROM comments WHERE comments_bugs_id = ?", [req.params.id], (err, results) => {
            res.send(results);
        });
    });
}

module.exports = commentsRouter;