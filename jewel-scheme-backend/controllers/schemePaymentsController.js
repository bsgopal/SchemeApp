import db from "../config/db.js";
import Razorpay from "razorpay";
import crypto from "crypto";

// ---------- Utility ----------
function formatDateTime(date = new Date()) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}
const safe = (val, def = null) => (val === undefined || val === null ? def : val);

// -------------------------------------------------------------
// Get all payments (limit 20)
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// Manual Payment (Cash/Bank Transfer)
// -------------------------------------------------------------
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

      // 🔹 Generate all installments
      const now = formatDateTime();
      for (let i = 1; i <= totalInstallments; i++) {
        await conn.execute(
          `INSERT INTO installments (membership_id, installment_no, amount, status, created_time)
           VALUES (?, ?, ?, 'pending', ?)`,
          [finalMembershipId, i, amount, now]
        );
      }
    } else {
      const [m] = await conn.execute("SELECT member_no, no_of_inst FROM scheme_memberships WHERE id=?", [finalMembershipId]);
      finalMemberNo = m.length ? m[0].member_no : null;
      var totalInstallments = m.length ? m[0].no_of_inst : null;
    }

    // 🔹 Determine next installment
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

    // 🔹 Update installment record
    const now = formatDateTime();
    await conn.execute(
      `UPDATE installments SET status='paid', paid_date=?, last_modified=? 
       WHERE membership_id=? AND installment_no=?`,
      [now, now, finalMembershipId, nextInstallmentNo]
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

// -------------------------------------------------------------
// Join Plan + Create Membership + Initial Installments
// -------------------------------------------------------------
export const joinPlanPayment = async (req, res) => {
  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    let { plan_id, group_id, customer_user_id, branch_id, amount } = req.body;
    console.log(customer_user_id);
    branch_id = branch_id || null;

    if (!plan_id || !customer_user_id ) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const generatedReceiptNo = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 🔹 Fetch or init group sequence
    let [seqRow] = await conn.execute(
      `SELECT gs.last_number, sg.no_of_inst
       FROM group_sequences gs
       JOIN scheme_groups sg ON sg.id = gs.group_id
       WHERE gs.group_id = ? FOR UPDATE`,
      [group_id]
    );
    console.log(seqRow);
    if (seqRow.length === 0) {
      const [groupInfo] = await conn.execute("SELECT no_of_inst FROM scheme_groups WHERE id=?", [group_id]);
      if (groupInfo.length === 0) throw new Error("Invalid group_id");

      await conn.execute("INSERT INTO group_sequences (group_id, last_number) VALUES (?, 0)", [group_id]);
      [seqRow] = await conn.execute(
        `SELECT gs.last_number, sg.no_of_inst
         FROM group_sequences gs
         JOIN scheme_groups sg ON sg.id = gs.group_id
         WHERE gs.group_id = ? FOR UPDATE`,
        [group_id]
      );
    }

    // 🔹 Create membership
    const newNumber = seqRow[0].last_number + 1;
    const totalInstallments = seqRow[0].no_of_inst;
    const memberNo = `GRP${group_id}-${newNumber}`;
    const now = formatDateTime();

    await conn.execute("UPDATE group_sequences SET last_number=? WHERE group_id=?", [newNumber, group_id]);
    const [memberResult] = await conn.execute(
      `INSERT INTO scheme_memberships 
        (group_id, customer_user_id, member_no, status, join_date, branch_id, collection_type) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [group_id, customer_user_id, memberNo, "active", now, branch_id, "direct"]
    );

    const membershipId = memberResult.insertId;

    // 🔹 Create all installments
    for (let i = 1; i <= totalInstallments; i++) {
      const due = new Date();
      due.setMonth(due.getMonth() + i - 1);

      const dueDate = due.toISOString().slice(0, 19).replace("T", " ");
      await conn.execute(
        `INSERT INTO installments (membership_id, installment_no, due_date, amount, status, created_time)
         VALUES (?, ?, ?, ?, 'pending', ?)`,
        [membershipId, i, dueDate, amount, now]
      );
    } 

    // 🔹 Insert first payment + mark installment
    const [paymentResult] = await conn.execute(
      `INSERT INTO scheme_payments 
        (receipt_no, receipt_date, membership_id, receipt_type, amount, mode_primary, status, created_time, branch_id, installment_no)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [generatedReceiptNo, now, membershipId, "installment", amount, "direct", "completed", now, branch_id, 1]
    );
    await conn.execute(
      `UPDATE installments SET status='paid', paid_date=?, updated_at=? 
       WHERE membership_id=? AND installment_no=?`,
      [now, now, membershipId, 1]
    );

    if (totalInstallments === 1) {
      await conn.execute(
        "UPDATE scheme_memberships SET status='completed', last_modified=? WHERE id=?",
        [now, membershipId]
      );
    }

    await conn.commit();

    res.json({
      success: true,
      message: "Plan joined and payment recorded",
      membership_id: membershipId,
      member_no: memberNo,
      transaction_id: generatedReceiptNo,
      payment_id: paymentResult.insertId,
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Error in joinPlanPayment:", err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

// -------------------------------------------------------------
// Pay Installment
// -------------------------------------------------------------
export const payInstallment = async (req, res) => {
  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    const { membership_id, amount, branch_id, mode_primary = "direct" } = req.body;
    const safeBranch = branch_id || null;

    if (!membership_id || !amount) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Fetch membership + group info
    const [membership] = await conn.execute(
      "SELECT group_id, status FROM scheme_memberships WHERE id = ?",
      [membership_id]
    );
    if (membership.length === 0) throw new Error("Membership not found");

    // Determine next installment
    const [countResult] = await conn.execute(
      "SELECT COUNT(*) AS paidCount FROM scheme_payments WHERE membership_id = ?",
      [membership_id]
    );
    const nextInstallment = countResult[0].paidCount + 1;
    const receiptNo = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = formatDateTime();

    // Insert payment
    const [result] = await conn.execute(
      `INSERT INTO scheme_payments 
         (receipt_no, receipt_date, membership_id, receipt_type, amount, mode_primary, status, created_time, branch_id, installment_no)
       VALUES (?, ?, ?, 'installment', ?, ?, 'completed', ?, ?, ?)`,
      [receiptNo, now, membership_id, amount, mode_primary, now, safeBranch, nextInstallment]
    );

    // Update installment
    await conn.execute(
      `UPDATE installments 
       SET status='paid', paid_date=?, last_modified=? 
       WHERE membership_id=? AND installment_no=?`,
      [now, now, membership_id, nextInstallment]
    );

    // Optional: check if completed
    const [instCount] = await conn.execute(
      "SELECT no_of_inst FROM scheme_groups g JOIN scheme_memberships m ON m.group_id = g.id WHERE m.id = ?",
      [membership_id]
    );
    const total = instCount[0]?.no_of_inst;
    if (nextInstallment >= total) {
      await conn.execute(
        "UPDATE scheme_memberships SET status='completed', last_modified=? WHERE id=?",
        [now, membership_id]
      );
    }

    await conn.commit();

    res.json({
      success: true,
      message: "Installment paid successfully",
      payment_id: result.insertId,
      installment_no: nextInstallment,
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Error in payInstallment:", err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

// -------------------------------------------------------------
// Adjust Installment (Manual correction)
// -------------------------------------------------------------
export const adjustInstallment = async (req, res) => {
  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    const { membership_id, installment_no, new_amount, remarks, status } = req.body;

    if (!membership_id || !installment_no) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const now = formatDateTime();

    // Update installment table
    await conn.execute(
      `UPDATE installments 
       SET amount = COALESCE(?, amount),
           status = COALESCE(?, status),
           remarks = COALESCE(?, remarks),
           last_modified = ?
       WHERE membership_id = ? AND installment_no = ?`,
      [new_amount, status, remarks, now, membership_id, installment_no]
    );

    // Reflect adjustment in payments if applicable
    if (status === "adjusted") {
      await conn.execute(
        `UPDATE scheme_payments 
         SET amount = ?, remarks = CONCAT(IFNULL(remarks, ''), ' | Adjusted: ', ?), last_modified=? 
         WHERE membership_id=? AND installment_no=?`,
        [new_amount, remarks || "Installment adjusted", now, membership_id, installment_no]
      );
    }

    await conn.commit();

    res.json({
      success: true,
      message: "Installment adjusted successfully",
      membership_id,
      installment_no,
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Error in adjustInstallment:", err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};
