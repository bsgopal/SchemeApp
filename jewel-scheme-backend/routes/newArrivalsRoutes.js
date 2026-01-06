import express from "express";
import {
  getNewArrivals,
  addNewArrival,
  updateNewArrival,
  deleteNewArrival
} from "../controllers/newArrivalsController.js";

import createUpload from "../middlewares/upload.js";

const router = express.Router();

// 🔥 upload middleware
const uploadNewArrivals = createUpload("newarrivals");

// -------------------- ROUTES --------------------

// GET all new arrivals
router.get("/", getNewArrivals);

// ADD new arrival (image optional)
router.post(
  "/",
  uploadNewArrivals.single("image"),
  addNewArrival
);

// UPDATE new arrival
router.put(
  "/:id",
  uploadNewArrivals.single("image"),
  updateNewArrival
);

// DELETE new arrival
router.delete("/:id", deleteNewArrival);

export default router;
