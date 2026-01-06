import multer from "multer";
import path from "path";
import fs from "fs";

// 🔥 reusable upload middleware
const createUpload = (folderName) => {
  const uploadDir = `uploads/${folderName}`;

  // ensure folder exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname).toLowerCase();

      cb(null, uniqueName);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const isExtValid = allowed.test(
      path.extname(file.originalname).toLowerCase()
    );
    const isMimeValid = allowed.test(file.mimetype);

    if (isExtValid && isMimeValid) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  });
};

export default createUpload;
