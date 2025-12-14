import db from "../config/db.js";

// -------------------------
// Utility
// -------------------------
function now() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}
const safe = (v, d = null) => (v === undefined || v === null ? d : v);

// ==========================================================
// 1️⃣ CREATE PAYMENT (Before Join)
// ==========================================================
export const createPayment = async (req, res) => {



  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const { customer_user_id, group_id, amount, branch_id } = req.body;

    if (!customer_user_id || !group_id || !amount)
      return res.status(400).json({ success: false, message: "Missing required fields" });

    const receiptNo = `PAY-${Date.now()}-${Math.floor(Math.random() * 999)}`;
    const nowTime = now();

    // store payment without membership_id
    const [p] = await conn.execute(
      `INSERT INTO scheme_payments
        (receipt_no, receipt_date, membership_id, receipt_type, amount,
         mode_primary, recorded_in, status, created_at, branch_id,
         customer_user_id, group_id)
       VALUES (?, ?, NULL, 'razorpay', ?, 'direct', 'online', 'pending', ?, ?, ?, ?)`,
      [receiptNo, nowTime, amount, nowTime, branch_id || null, customer_user_id, group_id]
    );

    await conn.commit();

    res.json({
      success: true,
      message: "Payment created",
      payment_id: p.insertId,
      receipt_no: receiptNo,
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("❌ createPayment:", err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

// ==========================================================
// 2️⃣ JOIN PLAN AFTER PAYMENT SUCCESS
// ==========================================================
export const joinPlanAfterPayment = async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const { payment_id, customer_user_id, group_id, branch_id } = req.body;
    console.log(payment_id, customer_user_id, group_id, branch_id)

    if (!payment_id || !customer_user_id || !group_id) {
      console.log("❗ JOIN RETURN 400: Missing required fields");
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Fetch Payment
    const [pay] = await conn.execute(
      `SELECT * FROM scheme_payments 
       WHERE id=? AND customer_user_id=? AND group_id=? FOR UPDATE`,
      [payment_id, customer_user_id, group_id]
    );
    if (pay.length === 0) throw new Error("Payment not found");

    const instAmount = pay[0].amount;
    const receiptNo = pay[0].receipt_no;

    // Prevent double join
    const [exist] = await conn.execute(
      `SELECT id, member_no FROM scheme_memberships 
       WHERE group_id=? AND customer_user_id=? LIMIT 1`,
      [group_id, customer_user_id]
    );

    if (exist.length > 0) {
      console.log("❗ JOIN RETURN 400: Already joined");
      return res.status(400).json({
        success: false,
        message: "Already joined",
        membership_id: exist[0].id,
        member_no: exist[0].member_no,
      });
    }
    // Fetch group
    const [grp] = await conn.execute(
      "SELECT no_of_inst FROM scheme_groups WHERE id=?",
      [group_id]
    );

    if (grp.length === 0)
      throw new Error("Invalid group");

    const totalInst = grp[0].no_of_inst;

    // Lock sequence & increment
    const [seq] = await conn.execute(
      "SELECT last_number FROM group_sequences WHERE group_id=? FOR UPDATE",
      [group_id]
    );

    let newNumber;
    if (seq.length === 0) {
      newNumber = 1;
      await conn.execute(
        "INSERT INTO group_sequences (group_id, last_number) VALUES (?,?)",
        [group_id, 1]
      );
    } else {
      newNumber = seq[0].last_number + 1;
      await conn.execute(
        "UPDATE group_sequences SET last_number=? WHERE group_id=?",
        [newNumber, group_id]
      );
    }

    // Create membership
    const memberNo = `GRP${group_id}-${newNumber}`;
    const nowTime = now();

    const [m] = await conn.execute(
      `INSERT INTO scheme_memberships
        (group_id, customer_user_id, member_no, status, join_date, branch_id,
         collection_type, created_time, no_of_inst)
       VALUES (?, ?, ?, 'active', ?, ?, 'online', ?, ?)`,
      [
        group_id,
        customer_user_id,
        memberNo,
        nowTime,
        branch_id || null,
        nowTime,
        totalInst,
      ]
    );

    const membershipId = m.insertId;

    // create all installments
    for (let i = 1; i <= totalInst; i++) {
      const due = new Date();
      due.setMonth(due.getMonth() + (i - 1));

      await conn.execute(
        `INSERT INTO installments
          (membership_id, installment_no, due_date, amount, status, created_time)
         VALUES (?, ?, ?, ?, 'pending', ?)`,
        [
          membershipId,
          i,
          due.toISOString().slice(0, 19).replace("T", " "),
          instAmount,
          nowTime,
        ]
      );
    }

    // Mark installment 1 as PAID
    await conn.execute(
      `UPDATE installments
       SET status='paid', paid_date=?, last_modified=?
       WHERE membership_id=? AND installment_no=1`,
      [nowTime, nowTime, membershipId]
    );

    // attach payment to membership
    await conn.execute(
      `UPDATE scheme_payments
       SET membership_id=?, inst_no=1,status='completed'
       WHERE id=?`,
      [membershipId, payment_id]
    );
    // 1️⃣ Get today's gold rate
    const [rateRow] = await conn.execute("SELECT goldRate FROM rates WHERE id = 1");
    const goldRate = rateRow.length ? rateRow[0].goldRate : null;

    if (!goldRate) throw new Error("Gold rate not set today");

    // 2️⃣ Calculate grams based on amount paid
    const grams = instAmount / goldRate;

    // 3️⃣ Update scheme_payments with gold rate + grams
    await conn.execute(
      `UPDATE scheme_payments 
   SET gold_rate=?, grams=?
   WHERE id=?`,
      [goldRate, grams, payment_id]
    );

    await conn.commit();

    res.json({
      success: true,
      message: "Joined after payment",
      membership_id: membershipId,
      member_no: memberNo,
      receipt_no: receiptNo,
    });

  } catch (err) {
    if (conn) await conn.rollback();
    console.error("❌ joinPlanAfterPayment:", err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

// ==========================================================
// 3️⃣ PAY NEXT INSTALLMENT
// ==========================================================
export const payInstallment = async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const { membership_id, amount, customer_user_id, branch_id } = req.body;

    if (!membership_id || !amount)
      return res.status(400).json({ success: false, message: "Missing fields" });

    // find next installment
    const [next] = await conn.execute(
      `SELECT installment_no FROM installments 
       WHERE membership_id=? AND status='pending'
       ORDER BY installment_no ASC LIMIT 1`,
      [membership_id]
    );

    if (next.length === 0)
      return res.status(400).json({ success: false, message: "No pending installments" });

    const instNo = next[0].installment_no;
    const nowTime = now();

    const receiptNo = `TXN-${Date.now()}-${Math.floor(Math.random() * 999)}`;

    // create payment
    const [p] = await conn.execute(
      `INSERT INTO scheme_payments
        (receipt_no, receipt_date, membership_id, receipt_type, amount,
         mode_primary, status, created_at, branch_id, inst_no, customer_user_id)
       VALUES (?, ?, ?, 'installment', ?, 'direct', 'completed', ?, ?, ?, ?)`,
      [
        receiptNo,
        nowTime,
        membership_id,
        amount,
        nowTime,
        branch_id || null,
        instNo,
        customer_user_id || null,
      ]
    );
    // ⭐ Get today's gold rate
    const [rateRow] = await conn.execute("SELECT goldRate FROM rates WHERE id = 1");
    const goldRate = rateRow.length ? rateRow[0].goldRate : null;
    if (!goldRate) throw new Error("Gold rate not set today");

    // ⭐ Calculate grams
    const grams = amount / goldRate;

    // ⭐ Update payment row
    await conn.execute(
      `UPDATE scheme_payments 
   SET gold_rate=?, grams=?
   WHERE id=?`,
      [goldRate, grams, p.insertId]
    );

    // mark installment paid
    await conn.execute(
      `UPDATE installments
       SET status='paid', paid_date=?, last_modified=?
       WHERE membership_id=? AND installment_no=?`,
      [nowTime, nowTime, membership_id, instNo]
    );

    await conn.commit();

    res.json({
      success: true,
      message: "Installment paid",
      payment_id: p.insertId,
      installment_no: instNo,
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("❌ payInstallment:", err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

// ==========================================================
// 4️⃣ Payment History
// ==========================================================
export const getPaymentHistory = async (req, res) => {
  try {
    const { membership_id } = req.query;

    const [rows] = await db.execute(
      `SELECT * FROM scheme_payments WHERE membership_id=? ORDER BY installment_no ASC`,
      [membership_id]
    );

    res.json({ success: true, payments: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================================
// 5️⃣ adjust Installment
// ==========================================================
export const adjustInstallment = async (req, res) => {
  return res.json({ success: true });
};
