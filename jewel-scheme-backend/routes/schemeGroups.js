import express from "express";
import { getAllGroups, createGroup, deleteGroup,getGroupById, updateGroup  } from "../controllers/schemeGroupsController.js";
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
router.get("/:id", getGroupById);
router.post("/", upload.single("banner"),createGroup);
router.delete("/:id", deleteGroup);
router.put("/:id", upload.single("banner"), updateGroup);
export default router;