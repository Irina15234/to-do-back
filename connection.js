const mysql = require("mysql2");
const util = require("util");
require("dotenv").config();

const connection = mysql.createPool({
    host: "localhost",
    user: "root",
    database: "trello",
    password: "StarS3000"
});

// promise wrapper to enable async await with MYSQL
connection.query = util.promisify(connection.query).bind(connection);

// connect to the database
connection.getConnection(function(err){
    if (err) {
        console.log("error connecting: " + err.stack);
        return;
    }
    console.log("connected as... " + connection.threadId);
});

module.exports = connection;
