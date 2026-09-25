import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// SVG is intentionally excluded: it can embed <script> and is a stored-XSS
// vector when served back from the same origin, even for admin-only uploads.
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const EXT_BY_TYPE: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => cb(null, `${randomUUID()}${EXT_BY_TYPE[file.mimetype] ?? ""}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      cb(new Error("Unsupported file type"));
      return;
    }
    cb(null, true);
  },
});

const MAX_WIDTH = 1600;

// Resizes and re-compresses an uploaded image in place so large phone-camera
// photos don't get served to every visitor at full resolution. GIF is
// skipped: sharp only reads its first frame, which would silently break
// animated uploads.
async function optimizeImage(filePath: string, mimetype: string): Promise<void> {
  if (mimetype === "image/gif") return;

  const tmpPath = `${filePath}.optimizing`;
  let pipeline = sharp(filePath)
    .rotate() // apply EXIF orientation, then strip metadata
    .resize({ width: MAX_WIDTH, withoutEnlargement: true });

  if (mimetype === "image/jpeg") {
    pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
  } else if (mimetype === "image/png") {
    pipeline = pipeline.png({ compressionLevel: 9 });
  } else if (mimetype === "image/webp") {
    pipeline = pipeline.webp({ quality: 82 });
  }

  await pipeline.toFile(tmpPath);
  await fs.promises.rename(tmpPath, filePath);
}

export const uploadsRouter = Router();

uploadsRouter.post("/", requireAuth, (req: AuthedRequest, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.join(UPLOADS_DIR, req.file.filename);
    try {
      await optimizeImage(filePath, req.file.mimetype);
    } catch (optimizeError) {
      // Serve the original upload rather than failing the request if
      // optimization errors out for any reason (e.g. a corrupt file).
      console.error("Image optimization failed:", optimizeError);
      await fs.promises.rm(`${filePath}.optimizing`, { force: true }).catch(() => {});
    }

    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});
