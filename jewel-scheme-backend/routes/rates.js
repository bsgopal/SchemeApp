import express from "express";
import axios from "axios";
import db from "../config/db.js";

const router = express.Router();

// 1 Troy Ounce = 31.1035 grams
const OUNCE_TO_GRAM = 31.1035;

// GET latest gold & silver rate
router.get("/", async (req, res) => {
  try {
    // 🔹 Free public API (NO KEY)
    const apiUrl = "https://data-asg.goldprice.org/dbXRates/INR";

    const response = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0" // required sometimes
      }
    });

    const item = response.data?.items?.[0];
    if (!item) {
      throw new Error("Invalid API response");
    }

    // API gives PRICE PER OUNCE
    const goldPerOunce = item.xauPrice;
    const silverPerOunce = item.xagPrice;

    // ✅ Convert to PER GRAM
    const goldPerGram24K = goldPerOunce / OUNCE_TO_GRAM;
    const goldPerGram22K = +(goldPerGram24K * (22 / 24)).toFixed(2);
    const silverPerGram = +(silverPerOunce / OUNCE_TO_GRAM).toFixed(2);

    // ✅ Save to DB (UPSERT)
    await db.query(
      `REPLACE INTO rates (id, goldRate, silverRate, updatedAt)
       VALUES (1, ?, ?, NOW())`,
      [goldPerGram22K, silverPerGram]
    );

    // ✅ Response to frontend
    res.json({
      source: "live_api",
      goldRate: goldPerGram22K,     // ₹ / gram (22K)
      silverRate: silverPerGram,    // ₹ / gram
      fetchedAt: new Date(),
    });

  } catch (err) {
    console.error("Gold API Error:", err.message);

    // 🔁 Fallback to DB
    const [rows] = await db.query("SELECT * FROM rates WHERE id = 1");

    res.json({
      source: "db_fallback",
      data: rows[0] || null,
      error: err.message,
    });
  }
});

export default router;
