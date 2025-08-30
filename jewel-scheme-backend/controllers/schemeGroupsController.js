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
   console.log("✅ getAllGroups called with query params:", req.query);
  try {
    // Extract query params
    const { branch_id, group_code, page = 1, limit = 20 } = req.query;

    // Build query dynamically
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
     console.log("Uploaded file:", req.file); 
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const {
              group_code,
              plan_name,
              plan_type,
              description,   // ✅ new
              amount_per_inst,
              gold_weight,
              jewellery_type,
              duration,
              no_of_members,
              start_no,      // ✅ new
              is_flexible,
              is_gold_scheme, // ✅ new
              bonus,
              total_balance,
              note,
              benefits = [],
              terms = [],
              status,
              priority,
              branch_id,
              sync_status    // ✅ new
            } = req.body;
            const banner_path = req.file ? `/uploads/${req.file.filename}` : null;
            console.log("Banner path to store:", banner_path);


      // Insert into scheme_groups
      const [result] = await conn.execute(
          `INSERT INTO scheme_groups 
            (group_code, plan_name, plan_type, description, amount_per_inst, 
            total_gold_balance, jewellery_type, no_of_inst, no_of_members, 
            start_no, is_flexible, is_gold_scheme, bonus, total_balance_amt, 
            note, banner_path , status, priority, branch_id, is_closed, sync_status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            group_code, plan_name, plan_type, description || null, amount_per_inst,
            gold_weight, jewellery_type, duration, no_of_members,
            start_no || null, is_flexible ? 1 : 0, is_gold_scheme ? 1 : 0, bonus, total_balance,
            note, banner_path, status, priority, branch_id, 0, sync_status || null
          ]
        );


      const schemeGroupId = result.insertId;

      // Insert benefits
      for (const benefit of benefits) {
        if (benefit) {
          await conn.execute(
            `INSERT INTO scheme_group_benefits (scheme_group_id, benefit_text) VALUES (?, ?)`,
            [schemeGroupId, benefit]
          );
        }
      }

      // Insert terms
      for (const term of terms) {
        if (term) {
          await conn.execute(
            `INSERT INTO scheme_group_terms (scheme_group_id, term_text) VALUES (?, ?)`,
            [schemeGroupId, term]
          );
        }
      }

      await conn.commit();
      res.json({ success: true, id: schemeGroupId });
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
    await pool.query("DELETE FROM scheme_groups WHERE id = ?", [id]);
    res.json({ success: true, message: "Plan deleted successfully" });
  } catch (err) {
    console.error("Error deleting plan:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

