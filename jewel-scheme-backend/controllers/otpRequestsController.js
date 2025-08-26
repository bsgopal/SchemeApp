import db from "../config/db.js";

// Get all OTP requests with optional filters and pagination
export const getAllOtps = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = "SELECT * FROM otp_requests WHERE 1=1";
    const params = [];

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const [rows] = await db.execute(query, params);
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

// Create a new OTP request
export const createOtp = async (req, res) => {
  try {
    const { action, target_user_id, requested_by, superadmin_user_id, otp_code, expires_at } = req.body;

    const [result] = await db.execute(
      `INSERT INTO otp_requests 
       (action, target_user_id, requested_by, superadmin_user_id, otp_code, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [action, target_user_id, requested_by, superadmin_user_id, otp_code, expires_at]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
