import express from "express";
import {
  getOffers,
  getSingleOffer,
  createOffer,
  updateOffer,
  deleteOffer
} from "../controllers/offers.controller.js";
import { adminOnly, verifyToken } from "../middlewares/authentication.js";
import createUpload from "../middlewares/upload.js";

const router = express.Router();
const upload = createUpload("offers");

// Everyone
router.get("/", getOffers);
router.get("/:id", getSingleOffer);   // 🔥 ADD THIS

// Admin only
router.post("/", verifyToken, adminOnly, upload.single("image"), createOffer);
router.put("/:id", verifyToken, adminOnly, upload.single("image"), updateOffer);
router.delete("/:id", verifyToken, adminOnly, deleteOffer);

export default router;
