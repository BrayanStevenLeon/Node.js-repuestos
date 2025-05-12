const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const connection = mysql.createConnection({
    host:process.env.DB_HOST,
    database:process.env.DB_DATABASE,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    port: process.env.MYSQLPORT || 3306
});

const getConnection = async ()=> await connection;

 module.exports = {
    getConnection
}

