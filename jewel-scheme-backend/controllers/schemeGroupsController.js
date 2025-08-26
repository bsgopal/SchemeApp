import db from "../config/db.js";

// Get all groups with optional filter and pagination
export const getAllGroups = async (req, res) => {
  try {
    const { branch_id, group_code, page = 1, limit = 20 } = req.query;
    let query = "SELECT * FROM scheme_groups WHERE 1=1";
    const params = [];

    if (branch_id) {
      query += " AND branch_id = ?";
      params.push(branch_id);
    }
    if (group_code) {
      query += " AND group_code LIKE ?";
      params.push(`%${group_code}%`);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const [rows] = await db.execute(query, params);

    // Optional computed field for display
    rows.forEach(row => {
      row.group_display = `${row.group_code} – ${row.note || 'No note'}`;
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


// Helper: convert undefined → null, booleans → 0/1
const safe = (val) => {
  if (val === undefined || val === "") return null;
  if (typeof val === "boolean") return val ? 1 : 0;
  return val === null ? null : val; // Ensure explicit null is preserved
};

export const createGroup = async (req, res) => {
  try {
    const {
      group_code,
      description,
      amount_per_inst,
      no_of_members,
      start_no,
      no_of_inst,
      is_flexible,
      is_gold_scheme,
      bonus,
      total_balance_amt,
      total_gold_balance,
      note,
      branch_id,
      is_closed,
      closed_date,
      sync_status
    } = req.body;

    // Check if branch_id exists to prevent foreign key error
    if (branch_id) {
      const [branchRows] = await db.execute(
        "SELECT id FROM branches WHERE id = ?",
        [branch_id]
      );
      if (branchRows.length === 0) {
        return res.status(400).json({ success: false, message: "Invalid branch_id" });
      }
    }

    // Prepare parameters with explicit null handling
    const params = [
      safe(group_code),
      safe(description),
      safe(amount_per_inst),
      safe(no_of_members),
      safe(start_no),
      safe(no_of_inst),
      safe(is_flexible),
      safe(is_gold_scheme),
      safe(bonus),
      safe(total_balance_amt),
      safe(total_gold_balance),
      safe(note),
      safe(branch_id),
      safe(is_closed),
      safe(closed_date),
      safe(sync_status)
    ];

    // Debug: log parameters to verify they're properly converted
    console.log("Parameters:", params);

    const [result] = await db.execute(
      `INSERT INTO scheme_groups 
        (group_code, description, amount_per_inst, no_of_members, start_no, no_of_inst,
         is_flexible, is_gold_scheme, bonus, total_balance_amt, total_gold_balance,
         note, branch_id, is_closed, closed_date, sync_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Error creating group:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};