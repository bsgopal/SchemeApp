import db from "../config/db.js";

// Get all assignments with agent, membership, and admin details
export const getAssignments = async (req, res) => {
  try {
    const { agent_user_id, membership_id, assigned_by } = req.query; // optional filters
    let query = `SELECT aa.id,
                  aa.assigned_at,
                  u_agent.name AS agent_name,
                  u_admin.name AS assigned_by_name,
                  sm.id AS membership_id,
                  sm.member_no,
                  sm.metal_name,
                  sm.status
                  FROM agent_assignments aa
                  JOIN users u_agent ON aa.agent_user_id = u_agent.id
                  JOIN users u_admin ON aa.assigned_by = u_admin.id
                  JOIN scheme_memberships sm ON aa.membership_id = sm.id
                  `;
    const params = [];

    if (agent_user_id) {
      query += " AND aa.agent_user_id = ?";
      params.push(agent_user_id);
    }
    if (membership_id) {
      query += " AND aa.membership_id = ?";
      params.push(membership_id);
    }
    if (assigned_by) {
      query += " AND aa.assigned_by = ?";
      params.push(assigned_by);
    }

    const [rows] = await db.execute(query, params);
    rows.forEach(row => {
      row.membership_display = `Member ${row.member_no} – ${row.metal_name} (${row.status})`;
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Create a new assignment
export const createAssignment = async (req, res) => {
  try {
    const { agent_user_id, membership_id, assigned_by } = req.body;

    const [result] = await db.execute(
      `INSERT INTO agent_assignments (agent_user_id, membership_id, assigned_by) 
       VALUES (?, ?, ?)`,
      [agent_user_id, membership_id, assigned_by]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
