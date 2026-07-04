// =============================================================
//  config/db.js — MongoDB Connection Manager
//
//  Responsibilities:
//    • Establish a Mongoose connection using the URI from .env
//    • Log connection state transitions (connected / error / disconnected)
//    • Retry failed initial connections with exponential back-off
//    • Export a single `connectDB` function consumed by server.js
// =============================================================

const mongoose = require("mongoose");

// ── Constants ────────────────────────────────────────────────
const MAX_RETRIES = 5;          // max initial-connection attempts
const RETRY_DELAY_MS = 3000;    // base delay between retries (ms)

// ── Mongoose global configuration ───────────────────────────
// Strict query: prevents Mongoose from filtering on undefined fields silently.
mongoose.set("strictQuery", true);

/**
 * Attempts to connect to MongoDB once.
 * Throws on failure so the caller can handle retries.
 */
async function attemptConnection() {
  await mongoose.connect(process.env.MONGO_URI, {
    // These are the recommended options for Mongoose 7+/8+
    serverSelectionTimeoutMS: 5000, // fail fast during initial probe
    socketTimeoutMS: 45000,         // abort queries that hang > 45 s
  });
}

/**
 * connectDB — Exported entry point.
 *
 * Tries to connect to MongoDB up to MAX_RETRIES times.
 * On permanent failure, exits the process (no point running the
 * API without a database).
 *
 * @returns {Promise<void>}
 */
async function connectDB() {
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      attempts++;
      console.log(
        `[DB] Connecting to MongoDB (attempt ${attempts}/${MAX_RETRIES})...`
      );

      await attemptConnection();

      // ── Success: register lifecycle listeners ────────────
      mongoose.connection.on("disconnected", () => {
        console.warn("[DB] ⚠ MongoDB disconnected. Attempting auto-reconnect…");
      });

      mongoose.connection.on("reconnected", () => {
        console.log("[DB] ✓ MongoDB reconnected successfully.");
      });

      mongoose.connection.on("error", (err) => {
        console.error("[DB] ✗ MongoDB runtime error:", err.message);
      });

      console.log(
        `[DB] ✓ MongoDB connected → ${mongoose.connection.host}/${mongoose.connection.name}`
      );
      return; // connection established — exit the retry loop
    } catch (err) {
      console.error(
        `[DB] ✗ Connection attempt ${attempts} failed: ${err.message}`
      );

      if (attempts >= MAX_RETRIES) {
        console.error(
          "[DB] ✗ All connection attempts exhausted. Shutting down."
        );
        process.exit(1);
      }

      // Exponential back-off: 3 s → 6 s → 12 s …
      const delay = RETRY_DELAY_MS * Math.pow(2, attempts - 1);
      console.log(`[DB] Retrying in ${delay / 1000} s…`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

module.exports = connectDB;
