import db from "../config/db.js";

// Get all payments with optional filters and pagination
export const getAllPayments = async (req, res) => {
  try {
    const { membership_id, branch_id, status, page = 1, limit = 20 } = req.query;
    let query = "SELECT * FROM scheme_payments WHERE 1=1";
    const params = [];

    if (membership_id) {
      query += " AND membership_id = ?";
      params.push(membership_id);
    }
    if (branch_id) {
      query += " AND branch_id = ?";
      params.push(branch_id);
    }
    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += " ORDER BY receipt_date DESC, created_at DESC LIMIT ? OFFSET ?";
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

// Create a new payment
export const createPayment = async (req, res) => {
  try {
    const {
      receipt_no,
      receipt_date,
      membership_id,
      receipt_type,
      amount,
      metal_wt,
      metal_rate,
      mode_primary,
      mode1_amount,
      mode_secondary,
      mode2_amount,
      recorded_in,
      staff_user_id,
      remarks,
      bank,
      inst_no,
      cancelled_amount,
      cancel_note,
      created_time,
      sync_status,
      branch_id,
      status
    } = req.body;

    const [result] = await db.execute(
      `INSERT INTO scheme_payments
      (receipt_no, receipt_date, membership_id, receipt_type, amount, metal_wt, metal_rate,
       mode_primary, mode1_amount, mode_secondary, mode2_amount, recorded_in, staff_user_id,
       remarks, bank, inst_no, cancelled_amount, cancel_note, created_time, sync_status, branch_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        receipt_no, receipt_date, membership_id, receipt_type, amount, metal_wt, metal_rate,
        mode_primary, mode1_amount, mode_secondary, mode2_amount, recorded_in, staff_user_id,
        remarks, bank, inst_no, cancelled_amount, cancel_note, created_time, sync_status, branch_id, status
      ]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
