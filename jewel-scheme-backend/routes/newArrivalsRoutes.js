import express from "express";
import {
  getNewArrivals,
  addNewArrival,
  updateNewArrival,
  deleteNewArrival,
  uploadNewArrivalImage
} from "../controllers/newArrivalsController.js";

const router = express.Router();

router.post("/upload", uploadNewArrivalImage, (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const url = `/uploads/newarrivals/${req.file.filename}`;
  res.json({ url });
});

// GET all
router.get("/", getNewArrivals);

// Add arrival (supports both image upload + image_url)
router.post("/", uploadNewArrivalImage, addNewArrival);

// Update
router.put("/:id", uploadNewArrivalImage, updateNewArrival);

// Delete
router.delete("/:id", deleteNewArrival);

export default router;
