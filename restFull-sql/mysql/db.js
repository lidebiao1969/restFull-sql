var mysql = require("mysql");
var dbMsg = {
    host: "localhost",
    user: "root",
    password: "1234",
    database: "users",
};

var connection = mysql.createConnection(dbMsg);
connection.connect();
module.exports = connection;