/**
 * History Routes
 * GET    /api/history         — list recent summaries for the current user
 * GET    /api/history/search  — search summaries for the current user
 * DELETE /api/history/:id     — delete one summary
 * DELETE /api/history         — clear all history for the current user
 */

import { Router } from "express";
import { listSummaries, searchSummaries, deleteSummary, clearAllSummaries, rowToSummary } from "../db.js";

const router = Router();

function getUserId(req) {
  const id = req.headers["x-user-id"];
  return typeof id === "string" ? id.trim() : "";
}

/** GET /api/history */
router.get("/", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.json({ success: true, data: [] });
    }
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const offset = parseInt(req.query.offset, 10) || 0;
    const rows = await listSummaries({ userId, limit, offset });
    res.json({ success: true, data: rows.map(rowToSummary) });
  } catch (err) {
    if (err.message === "Database not configured") {
      return res.json({ success: true, data: [] });
    }
    next(err);
  }
});

/** GET /api/history/search?q=... */
router.get("/search", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.json({ success: true, data: [] });
    }
    const q = req.query.q;
    if (!q || typeof q !== "string" || q.trim().length === 0) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const rows = await searchSummaries(userId, q.trim(), { limit });
    res.json({ success: true, data: rows.map(rowToSummary) });
  } catch (err) {
    if (err.message === "Database not configured") {
      return res.json({ success: true, data: [] });
    }
    next(err);
  }
});

/** DELETE /api/history/:id */
router.delete("/:id", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(400).json({ error: "Missing X-User-Id header" });
    }
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }
    const deleted = await deleteSummary(userId, id);
    res.json({ success: deleted, message: deleted ? "Deleted" : "Not found" });
  } catch (err) {
    if (err.message === "Database not configured") {
      return res.json({ success: true, message: "No DB" });
    }
    next(err);
  }
});

/** DELETE /api/history */
router.delete("/", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(400).json({ error: "Missing X-User-Id header" });
    }
    await clearAllSummaries(userId);
    res.json({ success: true, message: "History cleared" });
  } catch (err) {
    if (err.message === "Database not configured") {
      return res.json({ success: true, message: "No DB" });
    }
    next(err);
  }
});

export default router;
