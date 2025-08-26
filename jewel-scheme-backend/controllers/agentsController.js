

// Get all agents with user details
import db from "../config/db.js";

export const getAgents = async (req, res) => {
  try {
    const { area, user_id } = req.query; // optional filters
    let query = `SELECT a.id, a.user_id, u.name AS agent_name, a.area, a.notes, a.created_at, a.updated_at
                 FROM agents a
                 JOIN users u ON a.user_id = u.id
                 WHERE 1=1`;
    const params = [];

    if (area) {
      query += " AND a.area LIKE ?";
      params.push(`%${area}%`);
    }
    if (user_id) {
      query += " AND a.user_id = ?";
      params.push(user_id);
    }

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Create a new agent
export const createAgent = async (req, res) => {
  try {
    const { user_id, area, notes } = req.body;

    const [result] = await db.execute(
      `INSERT INTO agents (user_id, area, notes) VALUES (?, ?, ?)`,
      [user_id, area, notes]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
