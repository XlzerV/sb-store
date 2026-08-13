import { Router } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { requireAdmin } from "../middleware/auth";
import { saveImage } from "../lib/storage";

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

function sniffImage(buffer: Buffer): boolean {
  if (buffer.length < 16) return false;
  const hex = buffer.subarray(0, 12).toString("hex");
  const latin = buffer.toString("latin1", 0, 12);
  if (hex.startsWith("ffd8ff")) return true;
  if (hex.startsWith("89504e47")) return true;
  if (hex.startsWith("47494638")) return true;
  if (latin.startsWith("RIFF") && latin.slice(8, 12) === "WEBP") return true;
  return false;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const ok = ALLOWED_EXTENSIONS.includes(ext) && (file.mimetype || "").startsWith("image/");
    cb(null as any, ok);
  },
});

const router = Router();

router.post("/", requireAdmin, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  if (!sniffImage(req.file.buffer)) return res.status(400).json({ error: "File is not a valid image" });
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
  if (files.some((f) => !sniffImage(f.buffer))) {
    return res.status(400).json({ error: "One or more files are not valid images" });
  }
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
