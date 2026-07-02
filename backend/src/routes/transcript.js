/**
 * Transcript Routes
 * POST /api/transcript
 */

import { Router } from "express";
import { fetchTranscript } from "../services/transcript.js";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "YouTube URL is required" });
    }

    console.log(`[Transcript] Extracting: ${url}`);
    const startTime = Date.now();

    const result = await fetchTranscript(url);

    console.log(
      `[Transcript] Done: ${result.wordCount} words, ${result.segments} segments (${Date.now() - startTime}ms)`
    );

    res.json({
      success: true,
      videoId: result.videoId,
      transcript: result.transcript,
      meta: {
        segments: result.segments,
        durationSeconds: result.durationSeconds,
        wordCount: result.wordCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
