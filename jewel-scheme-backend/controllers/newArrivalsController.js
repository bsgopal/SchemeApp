import db from "../config/db.js";

// 📌 Middleware: check role
export function checkAdmin(req, res, next) {
  const role = req.headers["x-role"];
  if (role === "Admin" || role === "SuperAdmin") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Only Admins can perform this action" });
  }
}

// 📌 GET all new arrivals
export async function getNewArrivals(req, res) {
  try {
    const [rows] = await db.query("SELECT * FROM new_arrivals ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 📌 ADD new arrival
export async function addNewArrival(req, res) {
  try {
    const { title, price, offer } = req.body;

    if (!title || !price || !req.file) {
      return res.status(400).json({ message: "Title, Price, and Image are required" });
    }

    const image_url = `/uploads/newarrivals/${req.file.filename}`;

    await db.query(
      "INSERT INTO new_arrivals (title, price, offer, image_url) VALUES (?, ?, ?, ?)",
      [title, price, offer || null, image_url]
    );

    res.json({ message: "New arrival added successfully", image_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 📌 UPDATE new arrival
export async function updateNewArrival(req, res) {
  try {
    const { id } = req.params;
    const { title, price, offer } = req.body;
    let image_url = req.body.image_url;

    if (req.file) {
      image_url = `/uploads/newarrivals/${req.file.filename}`;
    }

    await db.query(
      "UPDATE new_arrivals SET title=?, price=?, offer=?, image_url=? WHERE id=?",
      [title, price, offer, image_url, id]
    );

    res.json({ message: "New arrival updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 📌 DELETE new arrival
export async function deleteNewArrival(req, res) {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM new_arrivals WHERE id=?", [id]);
    res.json({ message: "New arrival deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
