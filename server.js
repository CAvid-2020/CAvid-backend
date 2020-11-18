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

// Create tables

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

// GET student data from table

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

// GET attendants and filter by date

// app.get("/attendance/:date", (req, res) => {
//   con.query(
//     `SELECT * FROM attendance WHERE date='${req.params.date}'`,
//     (err, result) => {
//       if (err) {
//         console.log(err);
//         res.status(400).send("Not Ok");
//       } else {
//         res.json(result);
//       }
//     }
//   );
// });

// GET attendants and filter by date

app.get("/attendance", (req, res) => {
  con.query(
    "SELECT b.id, b.student_id, b.date, b.attendance, a.name, a.surname, a.email FROM students a INNER JOIN attendance b ON a.id = b.student_id",
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

// DELETE from table with a password

app.delete("/delete/:id", (req, res) => {
  if (req.body.pass === "gaidys") {
    con.query(
      `DELETE FROM attendance WHERE id = '${req.params.id}'`,
      (err, result) => {
        if (err) {
          res.status(400).json(err);
        } else {
          res.json(result);
        }
      }
    );
  } else {
    res.status(400).send("Bad request");
  }
});

// POST data to attendance table and validate

app.post("/attendance", (req, res) => {
  const data = req.body;
  if (data.student_id && data.date && data.attendance == "true") {
    con.query(
      `INSERT INTO attendance (student_id, date, attendance) VALUES ('${data.student_id}', '${data.date}', '${data.attendance}')`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send("Not sent");
        } else {
          res.json(result);
        }
      }
    );
  } else {
    res.status(400).send("Not sent");
  }
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
