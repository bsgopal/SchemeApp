import db from "../config/db.js";

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const [user] = await db.execute(
      `SELECT id, name, mobile, email, title, role, status 
       FROM users WHERE id = ?`,
      [userId]
    );

    if (user.length === 0)
      return res.status(404).json({ success: false, message: "User not found" });

    const [profile] = await db.execute(
      `SELECT address, place, pincode, dob, anniversary, aadhaar, pan,
              nominee_name, nominee_mobile, nominee_relation
       FROM customer_profiles WHERE user_id = ?`,
      [userId]
    );

    return res.json({
      success: true,
      user: { ...user[0], ...profile[0] },
    });

  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
