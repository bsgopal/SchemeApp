import db from "../config/db.js";

// Utility to format MySQL datetime
const formatDate = (date) => date.toISOString().slice(0, 19).replace("T", " ");

// -----------------------------
// Get all memberships (no user-controlled limit)
// -----------------------------
export const getAllMemberships = async (req, res) => {
  try {
    const { group_id, customer_user_id, status } = req.query;
    const page = 1;   // fixed
    const limit = 20; // fixed
    const offset = 0; // always first page for now

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

    query += " ORDER BY join_date DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await db.execute(query, params);

    rows.forEach((row) => {
      row.membership_display = `Member ${row.member_no || "N/A"} – ${row.metal_name || "N/A"} (${row.status})`;
    });

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Error in getAllMemberships:", err);
    res.status(500).json({ message: err.message });
  }
};

// -----------------------------
// Create Membership (safe, transaction + lock)
// -----------------------------
export const createMembership = async (req, res) => {
  const connection = await db.getConnection(); // start transaction
  try {
    const { group_id, customer_user_id, inst_amount, notes = null, pan_number = null } = req.body;

    await connection.beginTransaction();

    // 1. Fetch group details
    const [groups] = await connection.execute(
      "SELECT no_of_inst, group_code FROM scheme_groups WHERE id = ? FOR UPDATE",
      [group_id]
    );
    if (groups.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Invalid group_id" });
    }

    const { no_of_inst, group_code } = groups[0];
    const prefix = group_code.substring(0, 3).toUpperCase();

    // 2. Count members in this group
    const [countRows] = await connection.execute(
      "SELECT COUNT(*) as total FROM scheme_memberships WHERE group_id = ? FOR UPDATE",
      [group_id]
    );
    if (countRows[0].total >= 300) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "This group has reached the maximum limit of 300 members",
      });
    }

    // 3. Find last member_no (lock row)
    const [lastMember] = await connection.execute(
      "SELECT member_no FROM scheme_memberships WHERE group_id = ? ORDER BY id DESC LIMIT 1 FOR UPDATE",
      [group_id]
    );

    let nextNumber = 101;
    if (lastMember.length > 0) {
      const lastMemberNo = lastMember[0].member_no;
      const numericPart = parseInt(lastMemberNo.replace(/\D/g, ""), 10);
      if (!isNaN(numericPart)) {
        nextNumber = numericPart + 1;
      }
    }
    const member_no = `${prefix}${nextNumber}`;

    // 4. Auto fields
    const join_date_obj = new Date();
    const join_date = formatDate(join_date_obj);
    const maturity_date_obj = new Date(join_date_obj);
    maturity_date_obj.setMonth(maturity_date_obj.getMonth() + no_of_inst);
    const maturity_date = formatDate(maturity_date_obj);

    const status = "active";
    const collection_type = "manual";
    const metal_name = "gold";
    const silver_balance = 0;
    const last_modified = formatDate(new Date());
    const branch_id = 1;

    // 5. Insert membership
    const [result] = await connection.execute(
      `INSERT INTO scheme_memberships 
      (group_id, customer_user_id, member_no, inst_amount, join_date, maturity_date, status, 
       collection_type, metal_name, silver_balance, last_modified, branch_id, notes, is_closed, pan_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        branch_id,
        notes,
        0, // is_closed default
        pan_number,
      ]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      id: result.insertId,
      member_no,
      join_date,
      maturity_date,
    });
  } catch (err) {
    console.error("❌ Error in createMembership:", err);
    await connection.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};
