import db from "../config/db.js";

export const getAllLogs = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM audit_logs");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createLog = async (req, res) => {
  try {
    const { user_id, action, timestamp } = req.body;
    const [result] = await db.execute(
      "INSERT INTO audit_logs (user_id, action, timestamp) VALUES (?, ?, ?)",
      [user_id, action, timestamp]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
