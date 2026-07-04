// =============================================================
//  config/multer.js — Secure File Upload Configuration
//
//  Uses multer with:
//    • Disk storage (files land in /uploads/<date-based subfolder>)
//    • Strict MIME-type allow-list (PDF, JPEG, PNG only)
//    • File-size cap driven by MAX_FILE_SIZE_MB env variable
//    • Sanitised, collision-proof filenames
// =============================================================

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// ── Allowed MIME types for medical documents ─────────────────
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

// ── Storage engine ───────────────────────────────────────────
const storage = multer.diskStorage({
  /**
   * destination — determines the folder where the file is saved.
   * Creates the directory if it does not yet exist.
   */
  destination(req, file, cb) {
    const base = process.env.UPLOAD_DIR || "uploads";
    // Organise uploads into YYYY-MM sub-folders for easy archival
    const datePart = new Date().toISOString().slice(0, 7); // "2024-03"
    const dir = path.join(__dirname, "..", base, datePart);

    fs.mkdirSync(dir, { recursive: true }); // no-op if already exists
    cb(null, dir);
  },

  /**
   * filename — generates a collision-proof, sanitised filename.
   * Format:  <timestamp>-<8-byte-hex>.<original-extension>
   * The original filename is intentionally discarded to prevent
   * path-traversal and other injection attacks.
   */
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uid = crypto.randomBytes(8).toString("hex");
    cb(null, `${Date.now()}-${uid}${ext}`);
  },
});

// ── MIME-type filter ─────────────────────────────────────────
function fileFilter(req, file, cb) {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type "${file.mimetype}". ` +
          "Only PDF, JPEG, and PNG are accepted."
      ),
      false
    );
  }
}

// ── Multer instance ──────────────────────────────────────────
const MAX_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB) || 5;

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE_MB * 1024 * 1024, // convert MB → bytes
  },
});

module.exports = upload;
