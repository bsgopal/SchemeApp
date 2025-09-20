import express from "express";
import upload from "../middlewares/upload.js";
import {
  checkAdmin,
  getNewArrivals,
  addNewArrival,
  updateNewArrival,
  deleteNewArrival,
} from "../controllers/newArrivalsController.js";

const router = express.Router();

// Routes
router.get("/", getNewArrivals);
router.post("/", checkAdmin, upload.single("image"), addNewArrival);
router.put("/:id", checkAdmin, upload.single("image"), updateNewArrival);
router.delete("/:id", checkAdmin, deleteNewArrival);

export default router;
