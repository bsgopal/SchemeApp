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

const formatDate = (date) =>
  date.toISOString().slice(0, 19).replace("T", " ");

export const createMembership = async (req, res) => {
  try {
    const {
      group_id,
      customer_user_id,
      inst_amount,
      notes = null,
      pan_number = null,
    } = req.body;

    // 1. Fetch group details
    const [groups] = await db.execute(
      "SELECT no_of_inst, group_code FROM scheme_groups WHERE id = ?",
      [group_id]
    );
    if (groups.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid group_id" });
    }

    const { no_of_inst, group_code } = groups[0];
    const prefix = group_code.substring(0, 3).toUpperCase(); // first 3 letters

    // 2. Find the last member_no for this group
    const [lastMember] = await db.execute(
      "SELECT member_no FROM scheme_memberships WHERE group_id = ? ORDER BY id DESC LIMIT 1",
      [group_id]
    );

    let nextNumber = 101; // start from 101 if no members exist
    if (lastMember.length > 0) {
      const lastMemberNo = lastMember[0].member_no; // e.g., GRP105
      const numericPart = parseInt(lastMemberNo.replace(/\D/g, ""), 10); // extract numbers
      if (!isNaN(numericPart)) {
        nextNumber = numericPart + 1;
      }
    }

    const member_no = `${prefix}${nextNumber}`;

    // 3. Auto-generated/default fields
    const join_date_obj = new Date();
    const join_date = formatDate(join_date_obj);

    // maturity = join_date + no_of_inst months
    const maturity_date_obj = new Date(join_date_obj);
    maturity_date_obj.setMonth(maturity_date_obj.getMonth() + no_of_inst);
    const maturity_date = formatDate(maturity_date_obj);

    const status = "active";
    const collection_type = "manual";
    const metal_name = "gold";
    const silver_balance = 0;
    const last_modified = formatDate(new Date());
    const introduced_by_user_id = null;
    const introducer_relation = null;
    const branch_id = 1;
    const is_closed = 0;

    // 4. Insert membership
    const [result] = await db.execute(
      `INSERT INTO scheme_memberships 
      (group_id, customer_user_id, member_no, inst_amount, join_date, maturity_date, status, collection_type, metal_name, silver_balance, last_modified, introduced_by_user_id, introducer_relation, branch_id, notes, is_closed, pan_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
        last_modified,
        introduced_by_user_id,
        introducer_relation,
        branch_id,
        notes,
        is_closed,
        pan_number,
      ]
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      member_no,
      join_date,
      maturity_date,
    });
  } catch (err) {
    console.error("❌ DB Error:", err);
    res.status(500).json({ message: err.message });
  }
};
