const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
require("dotenv").config();

const port = process.env.SERVER_PORT || 3000;

const con = mysql.createConnection({
  host: process.env.MYSQL_DB_HOST,
  user: process.env.MYSQL_DB_USER,
  password: process.env.MYSQL_DB_PASS,
  database: process.env.MYSQL_DB_NAME,
  port: process.env.MYSQL_DB_PORT,
});

con.connect((err) => {
  if (err) throw err;
  console.log("Successfully connected to DB");
});

const app = express();

con.query("SHOW tables like 'students'", (err, result) => {
  if (err) {
    throw err;
  } else if (result.length === 0) {
    con.query(
      "CREATE TABLE students (id INT AUTO_INCREMENT PRIMARY KEY, name TEXT, surname TEXT, email TEXT)",
      (err, result) => {
        if (err) throw err;
        console.log("Table 'students' created!");
      }
    );
  } else {
    console.log("Table 'student' found: " + result.length);
  }
});

con.query("SHOW tables like 'attendance'", (err, result) => {
  if (err) {
    throw err;
  } else if (result.length === 0) {
    con.query(
      "CREATE TABLE attendance (id INT AUTO_INCREMENT PRIMARY KEY, student_id INT, date TIMESTAMP, attendance TEXT)",
      (err, result) => {
        if (err) throw err;
        console.log("Table 'attendance' created!");
      }
    );
  } else {
    console.log("Table 'attendance' found: " + result.length);
  }
});

app.use(bodyParser.json());
app.use(cors());

app.get("/students", (req, res) => {
  con.query("SELECT * FROM students", (err, result) => {
    if (err) {
      console.log(err);
      res.status(400).send("Not Ok");
    } else {
      res.json(result);
    }
  });
});

app.get("/attendance/:date", (req, res) => {
  con.query(
    `SELECT * FROM attendance WHERE date='${req.params.date}'`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send("Not Ok");
      } else {
        res.json(result);
      }
    }
  );
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
