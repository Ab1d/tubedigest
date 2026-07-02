/**
 * Chat Routes
 * POST /api/chat/ask     — Ask a follow-up question about a video
 * POST /api/chat/suggest — Generate suggested follow-up questions
 */

import { Router } from "express";
import { fetchTranscript } from "../services/transcript.js";
import {
  checkProviderConfig,
  askQuestionWithProvider,
  generateSuggestedQuestionsWithProvider,
} from "../services/ai-provider.js";

const router = Router();

/**
 * POST /api/chat/ask
 * Body: { url?: string, transcript?: string, summary: object, question: string, history?: Array<{role,content}>, provider?: string, apiKey?: string, model?: string }
 */
router.post("/ask", async (req, res, next) => {
  try {
    const { url, transcript: providedTranscript, summary, question, history = [], provider, apiKey, model } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: "Question is required" });
    }
    if (!summary) {
      return res.status(400).json({ error: "Summary is required" });
    }

    const providerStatus = checkProviderConfig(provider, apiKey, model);
    if (!providerStatus.ok) {
      return res.status(503).json({
        error: "AI provider not configured",
        details: providerStatus.error,
        fix: providerStatus.fix,
      });
    }

    // Get transcript either from body or re-fetch from URL
    let transcript = providedTranscript;
    if (!transcript && url) {
      console.log(`[Chat] Re-fetching transcript for: ${url}`);
      const result = await fetchTranscript(url);
      transcript = result.transcript;
    }
    if (!transcript) {
      return res.status(400).json({
        error: "Transcript or URL is required",
        details: "Provide either a 'transcript' string or a 'url' to extract from.",
      });
    }

    console.log(`[Chat] Asking: "${question}" via ${providerStatus.provider}`);
    const answer = await askQuestionWithProvider(
      provider,
      apiKey,
      model,
      transcript,
      summary,
      question.trim(),
      history
    );

    res.json({ success: true, answer, provider: providerStatus.provider, model: providerStatus.model });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/chat/suggest
 * Body: { summary: object, provider?: string, apiKey?: string, model?: string }
 */
router.post("/suggest", async (req, res, next) => {
  try {
    const { summary, provider, apiKey, model } = req.body;

    if (!summary) {
      return res.status(400).json({ error: "Summary is required" });
    }

    const providerStatus = checkProviderConfig(provider, apiKey, model);
    if (!providerStatus.ok) {
      return res.status(503).json({
        error: "AI provider not configured",
        details: providerStatus.error,
        fix: providerStatus.fix,
      });
    }

    console.log(`[Chat] Generating suggested questions via ${providerStatus.provider}...`);
    const questions = await generateSuggestedQuestionsWithProvider(provider, apiKey, model, summary);

    res.json({ success: true, questions, provider: providerStatus.provider, model: providerStatus.model });
  } catch (error) {
    next(error);
  }
});

export default router;
