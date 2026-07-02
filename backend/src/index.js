/**
 * TubeDigest Local Backend
 * Self-hosted Express server for:
 * 1. YouTube transcript extraction
 * 2. AI summarization via local Ollama LLM
 */

import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import transcriptRoutes from "./routes/transcript.js";
import summarizeRoutes from "./routes/summarize.js";
import historyRoutes from "./routes/history.js";
import chatRoutes from "./routes/chat.js";
import providersRoutes from "./routes/providers.js";
import { initDb } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_DIST = path.join(__dirname, "../../frontend/dist");

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Serve built frontend in production
app.use(express.static(FRONTEND_DIST));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(FRONTEND_DIST, "index.html"));
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "tubedigest-local",
    version: "1.0.0",
    db: process.env.DATABASE_URL ? "configured" : "not configured",
  });
});

// Routes
app.use("/api/transcript", transcriptRoutes);
app.use("/api/summarize", summarizeRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/providers", providersRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error("[Error]", err.message);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// Initialize DB then start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`
╔═════════════════════════════════════════════════════════════════╗
║                                                   ║
║   📺  TubeDigest Local Backend                    ║
║   Running at http://localhost:${PORT}              ${PORT < 100 ? " " : ""}║
║                                                   ║
║   Endpoints:                                      ║
║   • GET  /api/health       - Health check        ║
║   • POST /api/transcript   - Extract transcript  ║
║   • POST /api/summarize    - AI summarize        ║
║   • GET  /api/history      - Summary history     ║
║   • POST /api/chat/ask     - Ask follow-up       ║
║   • POST /api/chat/suggest - Suggest questions   ║
║                                                   ║
╚═════════════════════════════════════════════════════════════════╝
  `);
  });
});
