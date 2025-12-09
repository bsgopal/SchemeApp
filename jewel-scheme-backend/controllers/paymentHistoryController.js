import db from "../config/db.js";

/**
 * 1️⃣ Get all users who made at least one payment
 */
export const getUsersWithPayments = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT DISTINCT u.id, u.name, u.mobile
      FROM users u
      INNER JOIN scheme_payments sp ON sp.customer_user_id = u.id
      ORDER BY u.name ASC
    `);

    res.json({ success: true, users: rows });
  } catch (err) {
    console.error("❌ getUsersWithPayments:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


/**
 * 2️⃣ Get full payment history for selected user
 * Includes:
 * - Memberships
 * - Installments (paid/pending)
 * - Payments
 */
export const getUserPaymentHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Fetch all memberships (plans)
    const [memberships] = await db.execute(
      `SELECT id AS membership_id, group_id, member_no, status, join_date
       FROM scheme_memberships
       WHERE customer_user_id = ?
       ORDER BY join_date DESC`,
      [userId]
    );

    // If the user has no plans
    if (memberships.length === 0) {
      return res.json({
        success: true,
        userId,
        plans: [],
      });
    }

    // 2. Loop each plan and fetch installment summary
    const results = [];
    for (const m of memberships) {
      const [inst] = await db.execute(
        `SELECT 
            COUNT(*) AS total_inst,
            SUM(CASE WHEN status='paid' THEN 1 ELSE 0 END) AS paid,
            SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending
         FROM installments WHERE membership_id=?`,
        [m.membership_id]
      );

      const [payments] = await db.execute(
        `SELECT id, receipt_no, amount, status, inst_no, receipt_date 
         FROM scheme_payments 
         WHERE membership_id=? ORDER BY inst_no ASC`,
        [m.membership_id]
      );

      results.push({
        membership_id: m.membership_id,
        group_id: m.group_id,
        member_no: m.member_no,
        status: m.status,
        join_date: m.join_date,
        installments: inst[0],
        payments,
      });
    }

    res.json({
      success: true,
      userId,
      plans: results,
    });
  } catch (err) {
    console.error("❌ getUserPaymentHistory:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
