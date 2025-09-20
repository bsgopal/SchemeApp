import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

import pool from "./config/db.js";

import agentAssignmentsRoutes from "./routes/agentAssignments.js";
import agentsRoutes from "./routes/agents.js"; 
import auditLogsRoutes from "./routes/auditLogs.js";
import authRoutes from "./routes/auth.js";
import branchesRoutes from "./routes/branches.js";
import otpRequestsRoutes from "./routes/otpRequests.js"; 
import schemeGroupsRoutes from "./routes/schemeGroups.js";
import schemeMembershipsRoutes from "./routes/schemeMemberships.js";
import schemePaymentsRoutes from "./routes/schemePayments.js";
import rates from "./routes/rates.js";
import newArrivalsRoutes from "./routes/newArrivalsRoutes.js";   // ✅ Added

const app = express();

// ✅ Static folder for images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ Middleware
app.use(express.json());
app.use(cors({
  origin: "*",   
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ✅ Check DB Connection
pool.getConnection()
  .then(connection => {
    console.log("✅ MySQL Connected...");
    connection.release();
  })
  .catch(error => {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  });

// ✅ Routes
app.use("/api/agent-assignments", agentAssignmentsRoutes);
app.use("/api/agents", agentsRoutes);
app.use("/api/audit-logs", auditLogsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/branches", branchesRoutes);
app.use("/api/otp-requests", otpRequestsRoutes);
app.use("/api/scheme-groups", schemeGroupsRoutes);
app.use("/api/scheme-memberships", schemeMembershipsRoutes);
app.use("/api/scheme-payments", schemePaymentsRoutes);
app.use("/api/rates", rates);
app.use("/api/newarrivals", newArrivalsRoutes);  // ✅ Added

// ✅ Health Check
app.get("/", (req, res) => res.send("Jewel Saving Scheme API Running..."));
app.get("/api/health", (req, res) => res.json({ status: "OK", message: "Server is running" }));

// ✅ Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong!", error: err.message });
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export { pool };
