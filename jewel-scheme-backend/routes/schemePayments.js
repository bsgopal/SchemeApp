// =============================
// routes/schemePayments.js
// =============================
import express from "express";
import db from "../config/db.js";
import {
  createPayment,
  joinPlanAfterPayment,
  payInstallment,
  getPaymentHistory,
  adjustInstallment
} from "../controllers/schemePaymentsController.js";

const router = express.Router();

// Step 1 → Create Payment
router.post("/payment", createPayment);

// Step 2 → Join After Payment
router.post("/join-after-payment", joinPlanAfterPayment);

// Pay future installments
router.post("/pay-installment", payInstallment);

// Payment history
router.get("/history", getPaymentHistory);

// Adjust installment
router.post("/adjust", adjustInstallment);


// Get installments by membership_id
  router.get("/installments/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const [rows] = await db.execute(
        `SELECT * FROM installments WHERE membership_id=? ORDER BY installment_no ASC`,
        [id]
      );
      res.json({ success: true, installments: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });


export default router;
