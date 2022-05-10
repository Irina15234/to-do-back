const mysql = require("mysql2");
const connection = mysql.createPool({
    host: "localhost",
    user: "root",
    database: "trello",
    password: "StarS3000"
});

exports.getBoards = function(req, res){
    connection.query("SELECT * FROM board", function(err, data) {
        if(err) return console.log(err);
        res.send(data);
    });
};