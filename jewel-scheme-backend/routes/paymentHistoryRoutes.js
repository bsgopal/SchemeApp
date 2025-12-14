import express from "express";
import {
    getUsersWithPayments,
    getUserPaymentHistory
} from "../controllers/paymentHistoryController.js";

const router = express.Router();

// ADMIN AUTH (copy from your existing logic)
const adminAuth = (req, res, next) => {
    const role = req.headers["x-admin-role"];

    if (role === "admin" || role === "superadmin" || role === "super_admin") {
        return next();
    }

    return res.status(403).json({ success: false, message: "Unauthorized" });
};

router.get("/user/self", async (req, res) => {
    const userId = req.headers["x-user-id"]; // or from token

    if (!userId) {
        return res.status(400).json({ success: false, message: "User ID missing" });
    }

    return getUserPaymentHistory({ params: { userId } }, res);
});



router.get("/users", adminAuth, getUsersWithPayments);
router.get("/user/:userId", adminAuth, getUserPaymentHistory);

export default router;
