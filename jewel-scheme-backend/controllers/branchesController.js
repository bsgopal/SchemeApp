import db from "../config/db.js";

// Get all branches with optional filters and pagination
export const getAllBranches = async (req, res) => {
  try {
    const { city, code, page = 1, limit = 20 } = req.query; // filters + pagination
    let query = "SELECT * FROM branches WHERE 1=1";
    const params = [];

    if (city) {
      query += " AND city LIKE ?";
      params.push(`%${city}%`);
    }
    if (code) {
      query += " AND code LIKE ?";
      params.push(`%${code}%`);
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const [rows] = await db.execute(query, params);

    // Add branch_display for frontend
    rows.forEach(row => {
      row.branch_display = `${row.code} - ${row.name} (${row.city || 'N/A'})`;
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

// Get branch by ID
export const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute("SELECT * FROM branches WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Branch not found" });

    const branch = rows[0];
    branch.branch_display = `${branch.code} - ${branch.name} (${branch.city || 'N/A'})`;

    res.json(branch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new branch
export const createBranch = async (req, res) => {
  try {
    const { code, name, city } = req.body;
    const [result] = await db.execute(
      "INSERT INTO branches (code, name, city) VALUES (?, ?, ?)",
      [code, name, city]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update branch
export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, city } = req.body;
    await db.execute(
      "UPDATE branches SET code = ?, name = ?, city = ? WHERE id = ?",
      [code, name, city, id]
    );
    res.json({ success: true, message: "Branch updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete branch
export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM branches WHERE id = ?", [id]);
    res.json({ success: true, message: "Branch deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
