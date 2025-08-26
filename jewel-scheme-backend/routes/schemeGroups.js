import express from "express";
import { getAllGroups, createGroup } from "../controllers/schemeGroupsController.js";

const router = express.Router();

router.get("/", getAllGroups);
router.post("/", createGroup);

export default router;