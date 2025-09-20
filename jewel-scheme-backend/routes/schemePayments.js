import express from "express";
import {
  getAllPayments,
  createPayment,
  // createOrder,
  verifyPayment,
} from "../controllers/schemePaymentsController.js";

const router = express.Router();

router.get("/", getAllPayments);
router.post("/", createPayment); // Manual entry
// router.post("/order", createOrder); // Razorpay order
router.post("/verify", verifyPayment); // Razorpay verify

export default router;
