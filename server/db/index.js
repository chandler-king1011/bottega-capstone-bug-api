require('dotenv').config();

const mySqlConn = {
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
    port: 3306
};


module.exports = mySqlConn;

