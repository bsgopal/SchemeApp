import db from "../config/db.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

// ----------------- Helper: Send OTP Email -----------------
async function sendOtpEmail(toEmail, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "bsgopal0@gmail.com",
        pass: "nytc funo civh qhdn" // Use your app password
      }
    });

    const mailOptions = {
      from: "bsgopal0@gmail.com",
      to: toEmail,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}. It is valid for 10 minutes.`
    };

    await transporter.sendMail(mailOptions);
    // console.log(`OTP sent to ${toEmail}: ${otp}`);
  } catch (err) {
    console.error("Failed to send OTP email:", err);
    throw new Error("Failed to send OTP email");
  }
}

// ----------------- Generate OTP -----------------
async function generateAndSendOTP(userId, email) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Delete previous OTPs for this user
  await db.execute("DELETE FROM otps WHERE user_id=?", [userId]);

  // Insert new OTP
  await db.execute("INSERT INTO otps (user_id, otp, expires_at) VALUES (?, ?, ?)", [userId, hashedOtp, expiresAt]);

  // Send OTP email
  await sendOtpEmail(email, otp);
}

// ----------------- Registration -----------------
export const register = async (req, res) => {
  try {
    const {
      firstname,
      email,
      mobile,
      password,
      address,
      state,
      city,
      pincode,
      nominee_name,
      nominee_mobile,
      nominee_relation,
      title,
      role // Added for SuperAdmin to specify role
    } = req.body;
      
    if (!title) {
      return res.status(400).json({ 
        success: false, 
        message: "Title is required" 
      });
    }

    const name = firstname || null;
    const branch_id = req.body.branch_id || null;
    const place = city || null;
    const dob = req.body.dob || null;
    const anniversary = req.body.anniversary || null;
    const aadhaar = req.body.aadhaar || null;
    const pan = req.body.pan || null;

    
    const [existing] = await db.execute("SELECT id FROM users WHERE mobile=? OR email=?", [mobile, email]);
    if (existing.length > 0)
      return res.status(400).json({ success: false, message: "Mobile or Email already exists" });

   
    const password_hash = await bcrypt.hash(password, 10);

   
    const userRole = role || "User";

    // Insert user - BOTH cases start as inactive until OTP verification
    const [userResult] = await db.execute(
      `INSERT INTO users (name, mobile, email, password_hash, branch_id, role, status, title)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, mobile, email, password_hash, branch_id || null, userRole, "inactive", title]
    );
    const userId = userResult.insertId;

    // Insert customer profile
    await db.execute(
      `INSERT INTO customer_profiles
       (user_id, address, place, pincode, dob, anniversary, aadhaar, pan, nominee_name, nominee_mobile, nominee_relation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        address || null,
        place,
        pincode || null,
        dob,
        anniversary,
        aadhaar,
        pan,
        nominee_name || null,
        nominee_mobile || null,
        nominee_relation || null,
      ]
    );

    // Generate and send OTP for verification
    await generateAndSendOTP(userId, email);

    res.json({ 
      success: true, 
      message: "Registration successful. OTP sent to email for verification.",
      userId 
    });
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

    if (!isValid)
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    // ✅ Activate user only after successful OTP verification
    await db.execute("UPDATE users SET status='active' WHERE id=?", [userId]);

    // Delete OTP
    await db.execute("DELETE FROM otps WHERE id=?", [rows[0].id]);

    res.json({ 
      success: true, 
      message: "OTP verified successfully. Account activated."
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ----------------- Resend OTP -----------------
export const resendOtp = async (req, res) => {
  try {
    const { userId, email } = req.body;
    if (!userId || !email)
      return res.status(400).json({ success: false, message: "User ID and email required" });

    await generateAndSendOTP(userId, email);
    res.json({ success: true, message: "OTP resent successfully" });
  } catch (err) {
    console.error("Resend OTP error:", err);
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
        title: user.title,
        state: user.state,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
