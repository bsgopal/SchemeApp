import express from "express";
import db from "../config/db.js";
import {
  getAllPayments,
  createPayment,
  // createOrder,
  // verifyPayment,
  joinPlanPayment ,
  payInstallment,
} from "../controllers/schemePaymentsController.js";

const router = express.Router();

router.get("/", getAllPayments);
router.post("/", createPayment); // Manual entry
// router.post("/order", createOrder); // Razorpay order
// router.post("/verify", verifyPayment); // Razorpay verify
router.post("/join-plan", joinPlanPayment);
router.post("/pay-installment", payInstallment);


router.get("/:membershipId", async (req, res) => {
  const { membershipId } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT 
         id, 
         receipt_no,
         amount, 
         receipt_date AS date, 
         status, 
         installment_no 
       FROM scheme_payments 
       WHERE membership_id = ?
       ORDER BY receipt_date DESC`,
      [membershipId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No payments found for this plan" });
    }

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching payments by membership:", err);
    res.status(500).json({ message: "Failed to fetch payment history" });
  }
});

export default router;
