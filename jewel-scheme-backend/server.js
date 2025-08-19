const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: "root1",        // your MySQL username
  password: "123456", // your MySQL password
  database: "jewel_scheme"
});

db.connect(err => {
  if (err) throw err;
  console.log("✅ MySQL Connected...");
});

app.get("/", (req, res) => {
  res.send("Jewel Saving Scheme API Running...");
});


app.post("/register", (req, res) => {
  const { firstname, titles, email, mobile, address1, state, city, pincode, password } = req.body;

  const checkQuery = "SELECT * FROM customers WHERE mobile = ?";
  db.query(checkQuery, [mobile], (err, result) => {
    if (err) {
     console.error("❌ MySQL Error (insert):");
        console.error("SQL Message:", err.sqlMessage);
        console.error("Error Code:", err.code);
        console.error("SQL State:", err.sqlState);
        console.error("Full Error Object:", err);

        return res.status(500).send({ message: "Server error", error: err.sqlMessage });
    }

    if (result.length > 0) {
      return res.status(400).send({ message: "Mobile number already exists" });
    }

    const insertQuery = "INSERT INTO customers (firstname, titles, email, mobile, address1, state, city, pincode, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(insertQuery, [firstname, titles, email, mobile, address1, state, city, pincode, password], (err, result) => {
      if (err) {
        console.error("❌ MySQL Error (insert):", err);
        return res.status(500).send({ message: "Server error" });
      }
      res.send({ message: "User registered successfully ✅", userId: result.insertId });
    });
  });
});



//------------Login Api--------
app.post("/login", (req, res) => {
  const { mobile, password } = req.body;
  const query = "SELECT * FROM customers WHERE mobile=? AND password=?";
  db.query(query, [mobile, password], (err, result) => {
    if (err) return res.status(500).send({ message: "Server error" });
    if (result.length > 0) {
      res.send({ 
        message: "Login successful", 
        success: true,
        user: {
        firstname: result[0].firstname,
        mobile: result[0].mobile,
        title: result[0].titles,
      }
      });
    } else {
      res.status(401).send({ message: "Invalid credentials" });
    }
  });
});

app.listen(5000, "0.0.0.0", () => console.log("🚀 Server running on port 5000 and accessible externally"));