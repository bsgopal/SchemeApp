import express from "express";
import {
  getWallet,
  addMoneyToWallet,
  convertCashToGold,
  payInstallmentWithWallet,
  getWalletHistory
} from "../controllers/walletController.js";

const router = express.Router();

router.get("/:userId", getWallet);
router.get("/history/:userId", getWalletHistory);
router.post("/add", addMoneyToWallet);
router.post("/convert", convertCashToGold);
router.post("/pay-installment", payInstallmentWithWallet);

export default router;
