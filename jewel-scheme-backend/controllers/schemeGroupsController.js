import db from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// Get all groups with optional filter and pagination

export const getAllGroups = async (req, res) => {
  try {
    // Extract query params
    const { branch_id, group_code, page = 1, limit = 20 } = req.query;

    // Build query dynamically
    let query = "SELECT * FROM scheme_groups WHERE 1=1 AND is_closed=0";
    const params = [];

    if (branch_id) {
      query += " AND branch_id = ?";
      params.push(branch_id);
    }
    if (group_code) {
      query += " AND group_code LIKE ?";
      params.push(`%${group_code}%`);
    }

    const limitInt = parseInt(limit, 10) || 20;
    const pageInt = parseInt(page, 10) || 1;
    const offset = (pageInt - 1) * limitInt;

    query += ` ORDER BY created_at DESC LIMIT ${limitInt} OFFSET ${offset}`;

    const [rows] = await db.execute(query, params);

    const host = req.protocol + "://" + req.get("host"); // full URL prefix
    const data = rows.map(row => ({
      ...row,
      banner: row.banner_path ? host + row.banner_path.replace(/\\/g, "/") : "/default-banner.jpg"
    }));

    res.json({
      success: true,
      page: pageInt,
      limit: limitInt,
      data
    });

  } catch (err) {
    console.error("DB Error in getAllGroups:", err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};


// Helper: convert undefined → null, booleans → 0/1
const safe = (val) => {
  if (val === undefined || val === "") return null;
  if (typeof val === "boolean") return val ? 1 : 0;
  return val === null ? null : val; // Ensure explicit null is preserved
};

export const createGroup = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      group_code,
      plan_name,
      plan_type,
      description,
      amount_per_inst,
      gold_weight,
      jewellery_type,
      duration,
      no_of_members,
      start_no,
      is_flexible,
      is_gold_scheme,
      bonus,
      total_balance,
      note,
      benefits = [],
      terms = [],
      status,
      priority,
      branch_id,
      sync_status,
      banner_url // ✅ optional
    } = req.body;

    // ✅ banner path (upload OR url)
    const uploadedBanner = req.file
      ? `/uploads/newplans/${req.file.filename}`
      : null;

    const banner_path = uploadedBanner ?? banner_url ?? null;

    console.log("Banner path to store:", banner_path);

    const [result] = await conn.execute(
      `INSERT INTO scheme_groups 
       (group_code, plan_name, plan_type, description, amount_per_inst, 
        total_gold_balance, jewellery_type, no_of_inst, no_of_members, 
        start_no, is_flexible, is_gold_scheme, bonus, total_balance_amt, 
        note, banner_path, status, priority, branch_id, is_closed, sync_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        safe(group_code),
        safe(plan_name),
        safe(plan_type),
        safe(description),
        safe(amount_per_inst),
        safe(gold_weight),
        safe(jewellery_type),
        safe(duration),
        safe(no_of_members),
        safe(start_no),
        is_flexible ? 1 : 0,
        is_gold_scheme ? 1 : 0,
        safe(bonus),
        safe(total_balance),
        safe(note),
        safe(banner_path),
        safe(status),
        safe(priority),
        safe(branch_id),
        0,
        safe(sync_status)
      ]
    );

    const schemeGroupId = result.insertId;

    // ✅ benefits
    for (const benefit of benefits) {
      if (benefit?.trim()) {
        await conn.execute(
          `INSERT INTO scheme_group_benefits (scheme_group_id, benefit_text)
           VALUES (?, ?)`,
          [schemeGroupId, benefit]
        );
      }
    }

    // ✅ terms
    for (const term of terms) {
      if (term?.trim()) {
        await conn.execute(
          `INSERT INTO scheme_group_terms (scheme_group_id, term_text)
           VALUES (?, ?)`,
          [schemeGroupId, term]
        );
      }
    }

    await conn.commit();
    res.json({
      success: true,
      id: schemeGroupId,
      banner: banner_path
    });
  } catch (err) {
    await conn.rollback();
    console.error("Error creating group:", err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};


// controller
export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "UPDATE scheme_groups SET is_closed = 1 WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    res.json({
      success: true,
      message: "Plan closed successfully"
    });
  } catch (err) {
    console.error("Error closing plan:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};



export const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT *,IFNULL(is_closed, 0) AS is_closed FROM scheme_groups WHERE id = ?", [id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateGroup = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params;
    const {
      group_code,
      plan_name,
      plan_type,
      description,
      amount_per_inst,
      gold_weight,
      jewellery_type,
      duration,
      no_of_members,
      start_no,
      is_flexible,
      is_gold_scheme,
      bonus,
      total_balance,
      note,
      status,
      priority,
      branch_id,
      sync_status,
      benefits = [],
      terms = []
    } = req.body;

    // Start transaction
    await conn.beginTransaction();

    // Get existing record (for old banner path)
    const [existing] = await conn.execute(
      "SELECT banner_path FROM scheme_groups WHERE id = ?",
      [id]
    );
    if (!existing.length) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    const oldBannerPath = existing[0].banner_path;
    const newBannerPath = req.file ? `/uploads/${req.file.filename}` : null;

    // Build update query
    const fields = [
      "group_code = ?",
      "plan_name = ?",
      "plan_type = ?",
      "description = ?",
      "amount_per_inst = ?",
      "total_gold_balance = ?",
      "jewellery_type = ?",
      "no_of_inst = ?",
      "no_of_members = ?",
      "start_no = ?",
      "is_flexible = ?",
      "is_gold_scheme = ?",
      "bonus = ?",
      "total_balance_amt = ?",
      "note = ?",
      "status = ?",
      "priority = ?",
      "branch_id = ?",
      "sync_status = ?"
    ];

    const params = [
      group_code, plan_name, plan_type, description || null,
      amount_per_inst, gold_weight, jewellery_type, duration, no_of_members,
      start_no || null, is_flexible ? 1 : 0, is_gold_scheme ? 1 : 0,
      bonus, total_balance, note, status, priority, branch_id, sync_status || null
    ];

    if (newBannerPath) {
      fields.push("banner_path = ?");
      params.push(newBannerPath);
    }

    params.push(id);

    // Update group
    await conn.execute(
      `UPDATE scheme_groups SET ${fields.join(", ")} WHERE id = ?`,
      params
    );

    // Update benefits
    await conn.execute("DELETE FROM scheme_group_benefits WHERE scheme_group_id = ?", [id]);
    for (const benefit of benefits) {
      if (benefit) {
        await conn.execute(
          "INSERT INTO scheme_group_benefits (scheme_group_id, benefit_text) VALUES (?, ?)",
          [id, benefit]
        );
      }
    }

    // Update terms
    await conn.execute("DELETE FROM scheme_group_terms WHERE scheme_group_id = ?", [id]);
    for (const term of terms) {
      if (term) {
        await conn.execute(
          "INSERT INTO scheme_group_terms (scheme_group_id, term_text) VALUES (?, ?)",
          [id, term]
        );
      }
    }

    await conn.commit();

    // Delete old banner if replaced
    if (newBannerPath && oldBannerPath && fs.existsSync(path.join(process.cwd(), oldBannerPath))) {
      fs.unlinkSync(path.join(process.cwd(), oldBannerPath));
    }

    res.json({ success: true, message: "Plan updated successfully" });
  } catch (err) {
    await conn.rollback();
    console.error("Error updating group:", err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};



