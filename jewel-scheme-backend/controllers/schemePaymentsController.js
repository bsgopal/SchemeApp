import db from "../config/db.js";
import Razorpay from "razorpay";
import crypto from "crypto";

function formatDateTime(date = new Date()) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

// ✅ Safe value: undefined → null
const safe = (val, def = null) => (val === undefined || val === null ? def : val);

// -----------------------------
// Get all payments (limit 20)
// -----------------------------
export const getAllPayments = async (req, res) => {
  try {
    const { membership_id, branch_id, status } = req.query;
    const limit = 20;
    const offset = 0;

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

    query += " ORDER BY receipt_date DESC, created_time DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await db.execute(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Error in getAllPayments:", err);
    res.status(500).json({ message: err.message });
  }
};

// -----------------------------
// Manual Payment (Cash/Bank Transfer)
// -----------------------------
export const createPayment = async (req, res) => {
  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    let {
      membership_id,
      group_id,
      customer_user_id,
      receipt_date,
      receipt_type,
      amount,
      mode_primary,
      status,
      metal_wt,
      metal_rate,
      mode1_amount,
      mode_secondary,
      mode2_amount,
      recorded_in = "system",
      staff_user_id,
      remarks,
      bank,
      inst_no,
      cancelled_amount = 0,
      cancel_note,
      branch_id,
    } = req.body;

    membership_id = safe(membership_id);
    group_id = safe(group_id);
    customer_user_id = safe(customer_user_id);
    branch_id = safe(branch_id);

    let finalMembershipId = membership_id;
    let finalMemberNo = null;
    const generatedReceiptNo = `RCPT-${Date.now()}`;

    // 🔹 Auto-create membership if missing
    if (!finalMembershipId) {
      const [seqRow] = await conn.execute(
        "SELECT last_number, no_of_inst FROM group_sequences WHERE group_id=? FOR UPDATE",
        [group_id]
      );
      if (seqRow.length === 0) throw new Error("Group sequence not initialized");

      const newNumber = seqRow[0].last_number + 1;
      finalMemberNo = `GRP${group_id}-${newNumber}`;
      await conn.execute("UPDATE group_sequences SET last_number=? WHERE group_id=?", [newNumber, group_id]);

      const [memberResult] = await conn.execute(
        `INSERT INTO scheme_memberships 
         (group_id, customer_user_id, member_no, status, created_time, branch_id) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [group_id, customer_user_id, finalMemberNo, "active", formatDateTime(), branch_id]
      );

      finalMembershipId = memberResult.insertId;
      var totalInstallments = seqRow[0].no_of_inst;
    } else {
      const [m] = await conn.execute("SELECT member_no, no_of_inst FROM scheme_memberships WHERE id=?", [finalMembershipId]);
      finalMemberNo = m.length ? m[0].member_no : null;
      var totalInstallments = m.length ? m[0].no_of_inst : null;
    }

    // 🔹 Check duplicate receipt_no
    const [dupCheck] = await conn.execute("SELECT id FROM scheme_payments WHERE receipt_no=?", [generatedReceiptNo]);
    if (dupCheck.length > 0) {
      await conn.rollback();
      return res.json({ success: true, duplicate: true, payment_id: dupCheck[0].id, message: "Duplicate receipt ignored" });
    }

    // 🔹 Determine next installment number
    const [paidCount] = await conn.execute(
      "SELECT COUNT(*) AS count FROM scheme_payments WHERE membership_id=? AND status='success'",
      [finalMembershipId]
    );
    const nextInstallmentNo = (paidCount[0].count || 0) + 1;

    // 🔹 Insert payment
    const [paymentResult] = await conn.execute(
      `INSERT INTO scheme_payments 
       (receipt_no, receipt_date, membership_id, receipt_type, amount, metal_wt, metal_rate,
        mode_primary, mode1_amount, mode_secondary, mode2_amount, recorded_in, staff_user_id,
        remarks, bank, inst_no, cancelled_amount, cancel_note, created_time, sync_status, branch_id, status, installment_no)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generatedReceiptNo,
        receipt_date ? formatDateTime(new Date(receipt_date)) : formatDateTime(),
        finalMembershipId,
        safe(receipt_type, "installment"),
        safe(amount, 0),
        safe(metal_wt),
        safe(metal_rate),
        safe(mode_primary),
        safe(mode1_amount),
        safe(mode_secondary),
        safe(mode2_amount),
        safe(recorded_in, "system"),
        safe(staff_user_id),
        safe(remarks),
        safe(bank),
        safe(inst_no),
        safe(cancelled_amount, 0),
        safe(cancel_note),
        formatDateTime(),
        "pending",
        branch_id,
        safe(status, "success"),
        nextInstallmentNo,
      ]
    );

    // 🔹 Update membership status
    const now = formatDateTime();
    if (totalInstallments && nextInstallmentNo >= totalInstallments) {
      await conn.execute("UPDATE scheme_memberships SET status='completed', last_modified=? WHERE id=?", [now, finalMembershipId]);
    } else {
      await conn.execute("UPDATE scheme_memberships SET last_modified=? WHERE id=?", [now, finalMembershipId]);
    }

    await conn.commit();

    res.json({
      success: true,
      membership_id: finalMembershipId,
      member_no: finalMemberNo,
      payment_id: paymentResult.insertId,
      installment_no: nextInstallmentNo,
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Error in createPayment:", err);
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
};

// -----------------------------
// Razorpay - Verify Payment
// -----------------------------
export const verifyPayment = async (req, res) => {
  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    let { razorpay_order_id, razorpay_payment_id, razorpay_signature, membership_id, group_id, customer_user_id, amount, branch_id } = req.body;

    razorpay_order_id = safe(razorpay_order_id);
    razorpay_payment_id = safe(razorpay_payment_id);
    razorpay_signature = safe(razorpay_signature);
    membership_id = safe(membership_id);
    group_id = safe(group_id);
    customer_user_id = safe(customer_user_id);
    branch_id = safe(branch_id);
    amount = safe(amount, 0);

    // ✅ Verify signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // ✅ Prevent duplicate payment
    const [existing] = await conn.execute(
      "SELECT id, membership_id, receipt_no FROM scheme_payments WHERE razorpay_payment_id=?",
      [razorpay_payment_id]
    );
    if (existing.length > 0) {
      await conn.rollback();
      return res.json({
        success: true,
        duplicate: true,
        payment_id: existing[0].id,
        membership_id: existing[0].membership_id,
        receipt_no: existing[0].receipt_no,
        message: "Payment already recorded",
      });
    }

    let finalMembershipId = membership_id;
    let finalMemberNo = null;
    const generatedReceiptNo = `RCPT-${Date.now()}`;

    // 🔹 Auto-create membership if missing
    if (!finalMembershipId) {
      const [seqRow] = await conn.execute(
        "SELECT last_number, no_of_inst FROM group_sequences WHERE group_id=? FOR UPDATE",
        [group_id]
      );
      if (seqRow.length === 0) throw new Error("Group sequence not initialized");

      const newNumber = seqRow[0].last_number + 1;
      finalMemberNo = `GRP${group_id}-${newNumber}`;
      await conn.execute("UPDATE group_sequences SET last_number=? WHERE group_id=?", [newNumber, group_id]);

      const [memberResult] = await conn.execute(
        `INSERT INTO scheme_memberships 
         (group_id, customer_user_id, member_no, status, created_time, branch_id) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [group_id, customer_user_id, finalMemberNo, "active", formatDateTime(), branch_id]
      );

      finalMembershipId = memberResult.insertId;
      var totalInstallments = seqRow[0].no_of_inst;
    } else {
      const [m] = await conn.execute("SELECT member_no, no_of_inst FROM scheme_memberships WHERE id=?", [finalMembershipId]);
      finalMemberNo = m.length ? m[0].member_no : null;
      var totalInstallments = m.length ? m[0].no_of_inst : null;
    }

    // 🔹 Determine next installment number
    const [paidCount] = await conn.execute(
      "SELECT COUNT(*) AS count FROM scheme_payments WHERE membership_id=? AND status='success'",
      [finalMembershipId]
    );
    const nextInstallmentNo = (paidCount[0].count || 0) + 1;

    // 🔹 Insert payment
    const now = formatDateTime();
    const [result] = await conn.execute(
      `INSERT INTO scheme_payments 
       (receipt_no, receipt_date, membership_id, receipt_type, amount, mode_primary, status, created_time, branch_id, razorpay_payment_id, installment_no)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [generatedReceiptNo, now, finalMembershipId, "installment", amount, "razorpay", "success", now, branch_id, razorpay_payment_id, nextInstallmentNo]
    );

    // 🔹 Update membership status
    if (totalInstallments && nextInstallmentNo >= totalInstallments) {
      await conn.execute("UPDATE scheme_memberships SET status='completed', last_modified=? WHERE id=?", [now, finalMembershipId]);
    } else {
      await conn.execute("UPDATE scheme_memberships SET last_modified=? WHERE id=?", [now, finalMembershipId]);
    }

    await conn.commit();

    res.json({
      success: true,
      membership_id: finalMembershipId,
      member_no: finalMemberNo,
      payment_id: result.insertId,
      installment_no: nextInstallmentNo,
      message: "Payment verified & recorded",
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Error in verifyPayment:", err);
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
};
