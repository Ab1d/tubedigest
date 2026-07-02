/**
 * AI Provider Service (Frontend)
 * Manages provider selection, API keys, and model preferences in localStorage.
 */

export interface ProviderConfig {
  id: string;
  name: string;
  models: string[];
  requiresApiKey: boolean;
}

export interface ActiveProvider {
  provider: string;
  apiKey: string;
  model: string;
}

import { getUserId } from "./userService";

const STORAGE_KEY = "tubedigest_provider_config";

function apiHeaders(contentType = false): Record<string, string> {
  const headers: Record<string, string> = { "X-User-Id": getUserId() };
  if (contentType) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
}

/* ───────────────────────── Provider Definitions ────────────────────────── */

export const BUILT_IN_PROVIDERS: ProviderConfig[] = [
  {
    id: "openai",
    name: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    requiresApiKey: true,
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    models: ["deepseek-chat", "deepseek-reasoner"],
    requiresApiKey: true,
  },
  {
    id: "anthropic",
    name: "Anthropic",
    models: [
      "claude-3-5-sonnet-20241022",
      "claude-3-opus-20240229",
      "claude-3-haiku-20240307",
    ],
    requiresApiKey: true,
  },
  {
    id: "google",
    name: "Google Gemini",
    models: [
      "gemini-1.5-pro-latest",
      "gemini-1.5-flash-latest",
      "gemini-2.0-flash-exp",
    ],
    requiresApiKey: true,
  },
  {
    id: "ollama",
    name: "Ollama (Local)",
    models: ["llama3.2", "llama3.1", "mistral", "phi4"],
    requiresApiKey: false,
  },
];

/* ───────────────────────── localStorage Helpers ────────────────────────── */

export function loadActiveProvider(): ActiveProvider | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.provider) return null;
    return {
      provider: String(parsed.provider),
      apiKey: String(parsed.apiKey || ""),
      model: String(parsed.model || ""),
    };
  } catch {
    return null;
  }
}

export function saveActiveProvider(config: ActiveProvider): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearActiveProvider(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/* ───────────────────────── Validation ──────────────────────────────────── */

export function validateProviderConfig(providerId: string, apiKey: string, model: string): { ok: boolean; error?: string } {
  const provider = BUILT_IN_PROVIDERS.find((p) => p.id === providerId);
  if (!provider) {
    return { ok: false, error: "Please select a provider." };
  }
  if (provider.requiresApiKey && !apiKey.trim()) {
    return { ok: false, error: `Please enter your ${provider.name} API key.` };
  }
  if (!model.trim()) {
    return { ok: false, error: "Please select a model." };
  }
  return { ok: true };
}

/* ───────────────────────── Backend Provider Fetch ──────────────────────── */

const API_BASE = import.meta.env.PROD ? "" : (import.meta.env.VITE_API_URL || "http://localhost:3001");

export async function fetchAvailableProviders(): Promise<ProviderConfig[]> {
  try {
    const response = await fetch(`${API_BASE}/api/providers`, {
      headers: apiHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return BUILT_IN_PROVIDERS;
    const data = await response.json();
    if (data.success && Array.isArray(data.providers)) {
      return data.providers as ProviderConfig[];
    }
    return BUILT_IN_PROVIDERS;
  } catch {
    return BUILT_IN_PROVIDERS;
  }
}

export async function validateProviderWithBackend(
  provider: string,
  apiKey: string,
  model: string
): Promise<{ ok: boolean; error?: string; fix?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/providers/validate`, {
      method: "POST",
      headers: apiHeaders(true),
      body: JSON.stringify({ provider, apiKey, model }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await response.json();
    if (data.valid) return { ok: true };
    return { ok: false, error: data.error, fix: data.fix };
  } catch {
    // If backend is unreachable, do basic local validation
    const local = validateProviderConfig(provider, apiKey, model);
    if (!local.ok) return { ok: false, error: local.error };
    return { ok: true };
  }
}

/* ───────────────────────── Helper: Build request body with credentials ─── */

export function withProviderCredentials(body: Record<string, unknown>): Record<string, unknown> {
  const active = loadActiveProvider();
  if (!active) return body;
  return {
    ...body,
    provider: active.provider,
    apiKey: active.apiKey,
    model: active.model,
  };
}
