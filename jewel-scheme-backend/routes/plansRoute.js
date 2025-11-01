import express from "express";

const router = express.Router();

// Temporary Plan Join API (frontend simulation)
router.post("/join", async (req, res) => {
  try {
    const { plan_id, user_id } = req.body;

    console.log("🪙 Plan joined successfully:", { plan_id, user_id });

    // You can later replace this with DB logic (insert into user_plans table)
    res.status(200).json({ 
      success: true, 
      message: "Plan joined successfully!",
      data: { plan_id, user_id } 
    });
  } catch (err) {
    console.error("❌ Plan join failed:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
