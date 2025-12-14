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

    // 1️⃣ Fetch all memberships + plan name
    const [memberships] = await db.execute(
      `SELECT 
          sm.id AS membership_id,
          sm.group_id,
          sm.member_no,
          sm.status,
          sm.join_date,
          sg.plan_name
       FROM scheme_memberships sm
       INNER JOIN scheme_groups sg ON sg.id = sm.group_id
       WHERE sm.customer_user_id = ?
       ORDER BY sm.join_date DESC`,
      [userId]
    );

    // No plans yet
    if (memberships.length === 0) {
      return res.json({ success: true, userId, plans: [] });
    }

    // 2️⃣ For each plan, fetch installments + payment history
    const results = [];

    for (const m of memberships) {
      const [inst] = await db.execute(
        `SELECT 
            COUNT(*) AS total_inst,
            SUM(CASE WHEN status='paid' THEN 1 ELSE 0 END) AS paid,
            SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending
         FROM installments 
         WHERE membership_id=?`,
        [m.membership_id]
      );

      const [payments] = await db.execute(
        `SELECT 
            sp.id,
            sp.receipt_no,
            sp.amount,
            sp.status,
            sp.inst_no,
            sp.receipt_date,
            sp.gold_rate,
            sp.grams,
            sg.plan_name
         FROM scheme_payments sp
         INNER JOIN scheme_memberships sm ON sm.id = sp.membership_id
         INNER JOIN scheme_groups sg ON sg.id = sm.group_id
         WHERE sp.membership_id=? 
         ORDER BY sp.inst_no ASC`,
        [m.membership_id]
      );

      results.push({
        membership_id: m.membership_id,
        group_id: m.group_id,
        plan_name: m.plan_name,    // ⭐ FIXED
        member_no: m.member_no,
        status: m.status,
        join_date: m.join_date,
        installments: {
          total_inst: Number(inst[0].total_inst),
          paid: Number(inst[0].paid),
          pending: Number(inst[0].pending),
        },

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
