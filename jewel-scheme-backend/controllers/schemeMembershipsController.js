import db from "../config/db.js";

// Get all memberships with optional filters and pagination
export const getAllMemberships = async (req, res) => {
  try {
    const { group_id, customer_user_id, status, page = 1, limit = 20 } = req.query;
    let query = "SELECT * FROM scheme_memberships WHERE 1=1";
    const params = [];

    if (group_id) {
      query += " AND group_id = ?";
      params.push(group_id);
    }
    if (customer_user_id) {
      query += " AND customer_user_id = ?";
      params.push(customer_user_id);
    }
    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += " ORDER BY join_date DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const [rows] = await db.execute(query, params);

    // Computed field for frontend
    rows.forEach(row => {
      row.membership_display = `Member ${row.member_no || 'N/A'} – ${row.metal_name || 'N/A'} (${row.status})`;
    });

    res.json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      data: rows
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new membership
export const createMembership = async (req, res) => {
  try {
    const {
      group_id,
      customer_user_id,
      member_no,
      inst_amount,
      join_date,
      maturity_date,
      status,
      collection_type,
      metal_name,
      silver_balance,
      introduced_by_user_id,
      introducer_relation,
      branch_id,
      notes,
      is_closed
    } = req.body;

    const [result] = await db.execute(
      `INSERT INTO scheme_memberships
      (group_id, customer_user_id, member_no, inst_amount, join_date, maturity_date, status,
       collection_type, metal_name, silver_balance, introduced_by_user_id, introducer_relation,
       branch_id, notes, is_closed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        group_id, customer_user_id, member_no, inst_amount, join_date, maturity_date, status,
        collection_type, metal_name, silver_balance, introduced_by_user_id, introducer_relation,
        branch_id, notes, is_closed
      ]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
