import db from "../config/db.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

// --------------------------------------------
// Helper: Send OTP
// --------------------------------------------
async function sendOtpEmail(to, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "bsgopal0@gmail.com",
      pass: "nytc funo civh qhdn"
    }
  });

  await transporter.sendMail({
    from: "bsgopal0@gmail.com",
    to,
    subject: "Your Password Reset OTP",
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`
  });
}

// --------------------------------------------
// Helper: Generate and Save OTP
// --------------------------------------------
async function generateOTP(userId, email) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashed = await bcrypt.hash(otp, 10);
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  await db.execute("DELETE FROM otps WHERE user_id=?", [userId]);

  await db.execute(
    "INSERT INTO otps (user_id, otp, expires_at) VALUES (?, ?, ?)",
    [userId, hashed, expires]
  );

  await sendOtpEmail(email, otp);
}

// ============================================================
// 1️⃣ REQUEST OTP  (Forgot Password)
// ============================================================
export const requestForgotPassword = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile)
      return res.status(400).json({ success: false, message: "Mobile is required" });

    const [rows] = await db.execute("SELECT * FROM users WHERE mobile=?", [mobile]);

    if (rows.length === 0)
      return res.status(404).json({ success: false, message: "User not found" });

    const user = rows[0];

    await generateOTP(user.id, user.email);

    return res.json({
      success: true,
      message: "OTP sent to your email",
      userId: user.id
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================
// 2️⃣ VERIFY PASSWORD RESET OTP
// ============================================================
export const verifyForgotOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    console.log("Verifying OTP for userId:", userId, "otp:", otp);

    if (!userId || !otp)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const [rows] = await db.execute(
      `SELECT * FROM otps 
   WHERE user_id=? AND expires_at > NOW()
   ORDER BY id DESC 
   LIMIT 1`,
      [userId]
    );

    if (rows.length === 0)
      return res.status(400).json({ success: false, message: "OTP expired or invalid" });

    const isMatch = await bcrypt.compare(otp.toString(), rows[0].otp);

    if (!isMatch)
      return res.status(400).json({ success: false, message: "Wrong OTP" });

    return res.json({
      success: true,
      message: "OTP verified. You can now reset your password."
    });

  } catch (error) {
    console.error("Verify Forgot OTP Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================
// 3️⃣ RESET PASSWORD (AFTER OTP VERIFIED)
// ============================================================
export const resetForgotPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const hash = await bcrypt.hash(newPassword, 10);

    await db.execute("UPDATE users SET password_hash=? WHERE id=?", [
      hash,
      userId
    ]);

    // delete used OTP
    await db.execute("DELETE FROM otps WHERE user_id=?", [userId]);

    return res.json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const resendForgotOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId)
      return res.status(400).json({ success: false, message: "User ID required" });

    const [rows] = await db.execute("SELECT email FROM users WHERE id=?", [userId]);

    if (rows.length === 0)
      return res.status(404).json({ success: false, message: "User not found" });

    const email = rows[0].email;

    await generateOTP(userId, email);

    return res.json({
      success: true,
      message: "OTP resent successfully"
    });

  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
