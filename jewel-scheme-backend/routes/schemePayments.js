import express from "express";
import { getAllPayments, createPayment } from "../controllers/schemePaymentsController.js";

const router = express.Router();

router.get("/", getAllPayments);
router.post("/", createPayment);

export default router;