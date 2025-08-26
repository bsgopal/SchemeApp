import db from "../config/db.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

// ----------------- Helper: Send OTP Email -----------------
async function sendOtpEmail(toEmail, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "bsgopal0@gmail.com",
      pass: "nytc funo civh qhdn"
    }
  });

  const mailOptions = {
    from: "bsgopal0@gmail.com",
    to: toEmail,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}. It is valid for 10 minutes.`
  };

  await transporter.sendMail(mailOptions);
}

// ----------------- Registration -----------------
export const register = async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      password,
      branch_id,
      address,
      place,
      pincode,
      dob,
      anniversary,
      aadhaar,
      pan,
      nominee_name,
      nominee_mobile,
      nominee_relation
    } = req.body;

    // Check if user exists
    const [existing] = await db.execute(
      "SELECT id FROM users WHERE mobile=? OR email=?",
      [mobile, email]
    );
    if (existing.length > 0)
      return res.status(400).json({ success: false, message: "Mobile or Email already exists" });

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const [userResult] = await db.execute(
      `INSERT INTO users (name, mobile, email, password_hash, branch_id, role, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, mobile, email, password_hash, branch_id, "user", "inactive"]
    );

    const userId = userResult.insertId;

    // Insert profile
    await db.execute(
      `INSERT INTO customer_profiles
       (user_id, address, place, pincode, dob, anniversary, aadhaar, pan, nominee_name, nominee_mobile, nominee_relation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, address, place, pincode, dob, anniversary, aadhaar, pan, nominee_name, nominee_mobile, nominee_relation]
    );

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.execute(
      "INSERT INTO otps (user_id, otp, expires_at) VALUES (?, ?, ?)",
      [userId, hashedOtp, expiresAt]
    );

    // Send OTP email
    await sendOtpEmail(email, otp);

    res.json({ success: true, message: "Registration successful. OTP sent to email.", userId });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ----------------- OTP Verification -----------------
export const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp)
      return res.status(400).json({ success: false, message: "User ID and OTP required" });

    const [rows] = await db.execute(
      "SELECT * FROM otps WHERE user_id=? AND expires_at>NOW() ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    if (rows.length === 0)
      return res.status(400).json({ success: false, message: "No valid OTP found" });

    const hashedOtp = rows[0].otp;
    const isValid = await bcrypt.compare(otp, hashedOtp);

    if (!isValid) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    // Activate user
    await db.execute("UPDATE users SET status='active' WHERE id=?", [userId]);

    // Delete OTP
    await db.execute("DELETE FROM otps WHERE id=?", [rows[0].id]);

    res.json({ success: true, message: "OTP verified successfully. User activated." });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ----------------- Login -----------------
export const login = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    const [rows] = await db.execute("SELECT * FROM users WHERE mobile=?", [mobile]);

    if (rows.length === 0)
      return res.status(401).json({ success: false, message: "Invalid mobile or password" });

    const user = rows[0];

    if (user.status !== "active")
      return res.status(403).json({ success: false, message: "User not activated. Verify OTP first." });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid mobile or password" });

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        state: user.state,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
