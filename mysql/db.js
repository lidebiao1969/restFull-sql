var mysql = require("mysql");
var dbMsg = {
    host: "localhost",
    user: "root",
    password: "",
    database: "mydb",
};

var connection = mysql.createConnection(dbMsg);
connection.connect();
module.exports = connection;