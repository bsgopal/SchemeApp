import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
// Load environment variables
dotenv.config();

// Import database connection
import pool from "./config/db.js";

// Import all route files
import agentAssignmentsRoutes from "./routes/agentAssignments.js";
import agentsRoutes from "./routes/agents.js"; // FIXED: removed apostrophe
import auditLogsRoutes from "./routes/auditLogs.js";
import authRoutes from "./routes/auth.js";
import branchesRoutes from "./routes/branches.js";
import otpRequestsRoutes from "./routes/otpRequests.js"; // FIXED: consistent naming
import schemeGroupsRoutes from "./routes/schemeGroups.js";
import schemeMembershipsRoutes from "./routes/schemeMemberships.js";
import schemePaymentsRoutes from "./routes/schemePayments.js";

const app = express();
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://renic-schemeapp.onrender.com",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log("✅ MySQL Connected...");
    connection.release();
  })
  .catch(error => {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  });

// Attach all routers with appropriate base paths
app.use("/api/agent-assignments", agentAssignmentsRoutes);
app.use("/api/agents", agentsRoutes); // FIXED: removed apostrophe
app.use("/api/audit-logs", auditLogsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/branches", branchesRoutes);
app.use("/api/otp-requests", otpRequestsRoutes); // ADDED: this was missing!
app.use("/api/scheme-groups", schemeGroupsRoutes);
app.use("/api/scheme-memberships", schemeMembershipsRoutes);
app.use("/api/scheme-payments", schemePaymentsRoutes);

// Basic health check route
app.get("/", (req, res) => res.send("Jewel Saving Scheme API Running..."));
app.get("/api/health", (req, res) => res.json({ status: "OK", message: "Server is running" }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong!", error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export { pool };


app.get("/api/health", (req, res) => 
  res.json({ status: "OK", message: "Server is running" })
);
