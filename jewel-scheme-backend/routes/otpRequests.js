import express from "express";
import { getAllOtps, createOtp } from "../controllers/otpRequestsController.js";

const router = express.Router();

router.get("/", getAllOtps);
router.post("/", createOtp);

export default router;