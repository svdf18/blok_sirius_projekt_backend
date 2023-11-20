import mysql from "mysql2";
import "dotenv/config";

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  database: process.env.MYSQL_DATABASE,
  password: process.env.MYSQL_PASSWORD,
});

// Attempt to connect to the MySQL database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    throw err;
  } else {
    console.log('Connected to MySQL');
  }
});

connection.on('error', (err) => {
  console.error('MySQL connection error:', err);
});

export default connection;