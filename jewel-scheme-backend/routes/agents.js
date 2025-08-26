import express from "express";
import { getAgents, createAgent } from "../controllers/agentsController.js";

const router = express.Router();

router.get("/", getAgents);
router.post("/", createAgent);

export default router;