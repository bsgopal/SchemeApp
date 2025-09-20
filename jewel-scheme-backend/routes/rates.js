// routes/rates.js
import express from "express";
import db from "../config/db.js";// your MySQL connection

const router = express.Router();

// Save or update today's rate
router.post("/set", async (req, res) => {
  const { goldRate, silverRate } = req.body;

  try {
    // upsert logic (only 1 row for latest rates)
    await db.query(
      "REPLACE INTO rates (id, goldRate, silverRate, updatedAt) VALUES (1, ?, ?, NOW())",
      [goldRate, silverRate]
    );

    res.json({ success: true, message: "Rates updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get latest rate
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM rates WHERE id = 1");
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
