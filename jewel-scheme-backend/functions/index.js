const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Test API
app.get("/", (req, res) => {
  res.send("🔥 Backend running on Firebase!");
});

// Example API
app.post("/api/test", (req, res) => {
  res.json({success: true, data: req.body});
});


exports.api = functions.https.onRequest(app);
