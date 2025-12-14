import express from "express";
import {
  requestForgotPassword,
  verifyForgotOtp,
  resetForgotPassword,
  resendForgotOtp
} from "../controllers/forgotPasswordController.js";

const router = express.Router();

// Send OTP
router.post("/forgot-password", requestForgotPassword);

// Verify OTP
router.post("/forgot-password-otp", verifyForgotOtp);

// Reset Password
router.post("/forgot-password-reset", resetForgotPassword);

//resend OTP
router.post("/forgot-password-resend", resendForgotOtp);

export default router;
