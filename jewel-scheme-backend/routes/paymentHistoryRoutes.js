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


router.get("/users", adminAuth, getUsersWithPayments);
router.get("/user/:userId", adminAuth, getUserPaymentHistory);

export default router;
