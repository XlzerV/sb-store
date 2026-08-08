import { Router } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { requireAdmin } from "../middleware/auth";
import { saveImage } from "../lib/storage";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".svg"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null as any, allowed.includes(ext));
  },
});

const router = Router();

router.post("/", requireAdmin, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  try {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    const url = await saveImage(filename, req.file.buffer, req.file.mimetype);
    res.json({ url });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

router.post("/multiple", requireAdmin, upload.array("files", 10), async (req, res) => {
  const files = req.files as Express.Multer.File[];
  if (!files?.length) return res.status(400).json({ error: "No files uploaded" });
  try {
    const urls: string[] = [];
    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `${uuidv4()}${ext}`;
      urls.push(await saveImage(filename, file.buffer, file.mimetype));
    }
    res.json({ urls });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
