import express, { json } from "express";
import db from "../config/db.js"; // adjust to your DB config path

const router = express.Router();

/**
 * GET /api/my-plans/:userId
 * Returns all schemes a user has joined
 */
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;
  const sort = req.query.sort || "DESC";
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  const sortOrder = sort.toUpperCase() === "ASC" ? "ASC" : "DESC";

  try {
    const [rows] = await db.query(
      `SELECT 
         sm.id,
         sm.group_id,
         sm.customer_user_id,
         sm.member_no,
         sm.inst_amount,
         sm.join_date,
         sg.plan_name AS plan_name,
         sg.no_of_inst AS duration,
         sg.amount_per_inst AS amount_per_inst
       FROM scheme_memberships sm
       JOIN scheme_groups sg ON sm.group_id = sg.id
       WHERE sm.customer_user_id = ?
       ORDER BY sm.join_date ${sortOrder}
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    console.log("Fetched plans:", rows); // debug
    res.json(rows);
    console.log(rows);
  } catch (err) {
    console.error("Error fetching plans:", err);
    res.status(500).json({ error: "Failed to fetch plans" });
  }
});

export default router;
