/**
 * Summarize Routes
 * POST /api/summarize      — Full pipeline: transcript + AI summary
 * POST /api/summarize/text — Summarize provided text directly
 */

import { Router } from "express";
import { fetchTranscript } from "../services/transcript.js";
import {
  checkProviderConfig,
  summarizeWithProvider,
} from "../services/ai-provider.js";
import { createSummary } from "../db.js";

/**
 * Fetch YouTube video metadata via oEmbed (no API key required)
 */
async function fetchYouTubeMetadata(url) {
  try {
    const encodedUrl = encodeURIComponent(url);
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodedUrl}&format=json`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title || "YouTube Video",
      channel: data.author_name || "YouTube Channel",
      thumbnail: data.thumbnail_url || "",
    };
  } catch {
    return null;
  }
}

const router = Router();

function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return "--:--";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * POST /api/summarize
 * Body: { url: string, provider?: string, apiKey?: string, model?: string }
 * Full pipeline: extract transcript → AI summary → return
 */
router.post("/", async (req, res, next) => {
  try {
    const { url, provider, apiKey, model } = req.body;

    if (!url) {
      return res.status(400).json({ error: "YouTube URL is required" });
    }

    // Step 1: Check AI provider config
    const providerStatus = checkProviderConfig(provider, apiKey, model);
    if (!providerStatus.ok) {
      return res.status(503).json({
        error: "AI provider not configured",
        details: providerStatus.error,
        fix: providerStatus.fix,
      });
    }

    // Step 2: Extract transcript + metadata
    console.log(`[Summarize] Step 1/3: Extracting transcript from: ${url}`);
    const transcriptStart = Date.now();
    const [transcriptResult, metadata] = await Promise.all([
      fetchTranscript(url),
      fetchYouTubeMetadata(url),
    ]);
    console.log(
      `[Summarize] Transcript extracted: ${transcriptResult.wordCount} words, ${transcriptResult.segments} segments (${Date.now() - transcriptStart}ms)`
    );

    // Step 3: Send to AI provider for summarization
    console.log(`[Summarize] Step 2/3: Sending to ${providerStatus.provider} (${providerStatus.model}) (${transcriptResult.wordCount} words)...`);
    const summaryStart = Date.now();

    const videoInfo = {
      title: metadata?.title || "YouTube Video",
      channel: metadata?.channel || "YouTube Channel",
    };
    const summary = await summarizeWithProvider(
      provider,
      apiKey,
      model,
      transcriptResult.timestampedTranscript,
      videoInfo
    );

    const processingTime = Date.now() - summaryStart;
    console.log(`[Summarize] Step 3/3: Summary received (${processingTime}ms)`);

    const result = {
      success: true,
      videoId: transcriptResult.videoId,
      summary,
      meta: {
        transcriptWords: transcriptResult.wordCount,
        transcriptSegments: transcriptResult.segments,
        durationSeconds: transcriptResult.durationSeconds,
        processingTimeMs: processingTime,
        aiModel: providerStatus.model,
        provider: providerStatus.provider,
      },
    };

    // Persist to database (fire-and-forget, don't block response)
    createSummary({
      videoId: transcriptResult.videoId,
      videoUrl: url,
      videoTitle: videoInfo.title || "YouTube Video",
      channelName: videoInfo.channel || "YouTube Channel",
      duration: formatDuration(transcriptResult.durationSeconds),
      thumbnailUrl: metadata?.thumbnail || `https://img.youtube.com/vi/${transcriptResult.videoId}/mqdefault.jpg`,
      summaryJson: summary,
    }).catch((err) => {
      if (err.message === "Database not configured") {
        console.warn("[DB] Skipping history persistence — DATABASE_URL not set.");
      } else {
        console.error("[DB] Failed to save summary:", err.message);
      }
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/summarize/text
 * Body: { text: string, provider?: string, apiKey?: string, model?: string }
 * Summarize provided text directly (no YouTube extraction)
 */
router.post("/text", async (req, res, next) => {
  try {
    const { text, provider, apiKey, model } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Text is required" });
    }

    const wordCount = text.split(/\s+/).length;
    if (wordCount < 50) {
      return res.status(400).json({
        error: "Text too short. Provide at least 50 words for meaningful summarization.",
      });
    }

    const providerStatus = checkProviderConfig(provider, apiKey, model);
    if (!providerStatus.ok) {
      return res.status(503).json({
        error: "AI provider not configured",
        details: providerStatus.error,
        fix: providerStatus.fix,
      });
    }

    console.log(`[Summarize] Summarizing ${wordCount} words of provided text via ${providerStatus.provider}...`);

    const summary = await summarizeWithProvider(provider, apiKey, model, text);

    res.json({
      success: true,
      summary,
      meta: { wordCount, aiModel: providerStatus.model, provider: providerStatus.provider },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/summarize/status
 * Query: ?provider=xxx&apiKey=xxx&model=xxx
 * Check if AI provider is configured
 */
router.get("/status", async (req, res) => {
  const { provider, apiKey, model } = req.query;
  const status = checkProviderConfig(provider, apiKey, model);
  res.json({
    ok: status.ok,
    provider: status.provider,
    model: status.model,
    legacy: status.legacy || undefined,
    error: status.error || undefined,
    fix: status.fix || undefined,
  });
});

export default router;
