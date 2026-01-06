import express from "express";
import {
  getAllGroups,
  createGroup,
  deleteGroup,
  getGroupById,
  updateGroup
} from "../controllers/schemeGroupsController.js";

import createUpload from "../middlewares/upload.js";

const router = express.Router();

// ✅ Upload middleware for new plans
const uploadNewPlans = createUpload("newplans");

// ---------------- ROUTES ----------------

// GET all groups
router.get("/", getAllGroups);

// GET group by ID
router.get("/:id", getGroupById);

// CREATE new plan (banner upload)
router.post(
  "/",
  uploadNewPlans.single("banner"),
  createGroup
);

// UPDATE plan (banner optional)
router.put(
  "/:id",
  uploadNewPlans.single("banner"),
  updateGroup
);

// DELETE plan
router.delete("/:id", deleteGroup);

export default router;
