/**
 * Provider Routes
 * GET  /api/providers         — List available AI providers
 * POST /api/providers/validate — Validate a provider configuration
 */

import { Router } from "express";
import { getAvailableProviders, checkProviderConfig } from "../services/ai-provider.js";

const router = Router();

/**
 * GET /api/providers
 * Returns the list of supported AI providers and their default models.
 */
router.get("/", async (req, res) => {
  res.json({
    success: true,
    providers: getAvailableProviders(),
  });
});

/**
 * POST /api/providers/validate
 * Body: { provider: string, apiKey?: string, model?: string }
 * Validates that the given provider config is usable.
 */
router.post("/validate", async (req, res) => {
  const { provider, apiKey, model } = req.body;
  const status = checkProviderConfig(provider, apiKey, model);
  res.json({
    success: status.ok,
    valid: status.ok,
    provider: status.provider,
    model: status.model,
    legacy: status.legacy || undefined,
    error: status.error || undefined,
    fix: status.fix || undefined,
  });
});

export default router;
