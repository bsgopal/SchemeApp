import db from "../config/db.js";

// Get all active offers
export const getOffers = async (req, res) => {
  const [rows] = await db.execute(
    `SELECT * FROM offers WHERE active=1 AND valid_from<=CURDATE() AND valid_to>=CURDATE()`
  );
  res.json(rows);
};

export const getSingleOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      `SELECT * FROM offers WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Get offer error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Create Offer
export const createOffer = async (req, res) => {
  try {
    const imageUrl = req.file
      ? `/uploads/offers/${req.file.filename}`
      : null;

    const {
      title = null,
      subtitle = null,
      bonus = null,
      validFrom = req.body.validFrom || new Date().toISOString().slice(0, 10),
      validTill = req.body.validTill || null
    } = req.body;


    const createdBy = req.user?.id || null;


    await db.execute(
      `INSERT INTO offers 
       (title, subtitle, bonus_value, valid_from, valid_to, image_url, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, subtitle, bonus, validFrom, validTill, imageUrl, createdBy]
    );

    res.json({ success: true, message: "Offer created successfully" });
  } catch (err) {
    console.error("Create Offer Error:", err);
    res.status(500).json({ message: "Offer creation failed" });
  }
};




// Update Offer
export const updateOffer = async (req, res) => {
  const { id } = req.params;
  await db.execute(
    `UPDATE offers SET title=?,subtitle=?,description=?,image_url=?,bonus_type=?,bonus_value=?,valid_from=?,valid_to=?
     WHERE id=?`,
    [...Object.values(req.body), id]
  );
  res.json({ success: true });
};

// Delete Offer
export const deleteOffer = async (req, res) => {
  const { id } = req.params;
  await db.execute(`DELETE FROM offers WHERE id=?`, [id]);
  res.json({ success: true });
};
