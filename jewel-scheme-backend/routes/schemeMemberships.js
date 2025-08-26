import express from "express";
import { getAllMemberships, createMembership } from "../controllers/schemeMembershipsController.js";

const router = express.Router();

router.get("/", getAllMemberships);
router.post("/", createMembership);

export default router;