import db from "../config/db.js";
import multer from "multer";
import path from "path";

// ---------------------- MULTER STORAGE ----------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/newarrivals");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

export const uploadNewArrivalImage = multer({ storage }).single("image");

// ---------------------- GET NEW ARRIVALS ----------------------
export async function getNewArrivals(req, res) {
  try {
    const [rows] = await db.query("SELECT * FROM new_arrivals ORDER BY created_at DESC");

    // Convert DB snake_case → camelCase for frontend
    const formatted = rows.map(r => ({
      id: r.id,
      title: r.title,
      price: r.price,
      offer: r.offer,
      imageUrl: r.image_url,   // IMPORTANT
      createdAt: r.created_at
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ---------------------- ADD NEW ARRIVAL ----------------------
export async function addNewArrival(req, res) {
  try {
    const { title, price, offer, image_url } = req.body;

    // If multer file uploaded
    const uploadedImage = req.file ? `/uploads/newarrivals/${req.file.filename}` : null;

    const finalImage = uploadedImage || image_url;

    if (!title || !price || !finalImage) {
      return res.status(400).json({ message: "Title, Price and Image are required" });
    }

    await db.query(
      "INSERT INTO new_arrivals (title, price, offer, image_url) VALUES (?, ?, ?, ?)",
      [title, price, offer || null, finalImage]
    );

    res.json({ message: "New arrival added", imageUrl: finalImage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ---------------------- UPDATE ----------------------
export async function updateNewArrival(req, res) {
  try {
    const { id } = req.params;
    const { title, price, offer, image_url } = req.body;

    const uploadedImage = req.file ? `/uploads/newarrivals/${req.file.filename}` : null;
    const finalImage = uploadedImage || image_url;

    await db.query(
      "UPDATE new_arrivals SET title=?, price=?, offer=?, image_url=? WHERE id=?",
      [title, price, offer, finalImage, id]
    );

    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ---------------------- DELETE ----------------------
export async function deleteNewArrival(req, res) {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM new_arrivals WHERE id=?", [id]);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
