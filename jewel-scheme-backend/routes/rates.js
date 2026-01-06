// // routes/rates.js
// import express from "express";
import db from "../config/db.js";// your MySQL connection

// const router = express.Router();

// // Save or update today's rate
// router.post("/set", async (req, res) => {
//   const { goldRate, silverRate } = req.body;

//   try {
//     // upsert logic (only 1 row for latest rates)
//     await db.query(
//       "REPLACE INTO rates (id, goldRate, silverRate, updatedAt) VALUES (1, ?, ?, NOW())",
//       [goldRate, silverRate]
//     );

//     res.json({ success: true, message: "Rates updated successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // Get latest rate
// router.get("/", async (req, res) => {
//   try {
//     const [rows] = await db.query("SELECT * FROM rates WHERE id = 1");
//     res.json(rows[0] || {});
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// export default router;


// routes/rates.js
import express from "express";
import axios from "axios";

const router = express.Router();

// ⚠️ HARD-CODED API KEY (TEMPORARY)
const GOLD_API_KEY = "goldapi-1cvh35smk1hipf1-io";

router.get("/", async (req, res) => {
  try {
    const headers = {
      "x-access-token": GOLD_API_KEY,
      "Content-Type": "application/json"
    };

    const [goldRes, silverRes] = await Promise.all([
      axios.get("https://www.goldapi.io/api/XAU/INR", { headers }),
      axios.get("https://www.goldapi.io/api/XAG/INR", { headers })
    ]);

    const goldRate = goldRes.data.price_gram_22k;
    const silverRate = silverRes.data.price_gram_22k;

    // Save latest rate to DB
    await db.query(
      "REPLACE INTO rates (id, goldRate, silverRate, updatedAt) VALUES (1, ?, ?, NOW())",
      [goldRate, silverRate]
    );

    res.json({
      source: "live_api",
      goldRate,
      silverRate,
      fetchedAt: new Date()
    });

  } catch (err) {
    console.error("GoldAPI ERROR:", err.response?.data || err.message);

    // fallback to DB
    const [rows] = await db.query("SELECT * FROM rates WHERE id = 1");
    res.json({
      source: "db_fallback",
      data: rows[0] || null,
      error: err.response?.data || err.message
    });
  }
});

export default router;
