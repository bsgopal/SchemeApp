import express from "express";
import { getAllGroups, createGroup, deleteGroup } from "../controllers/schemeGroupsController.js";
  import multer from "multer";
  

const router = express.Router();

// ✅ Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder where images will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.get("/", getAllGroups);
router.post("/", upload.single("banner"),createGroup);
router.delete("/:id", deleteGroup);
export default router;