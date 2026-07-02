/**
 * Generic AI Provider Service
 * Handles communication with multiple LLM providers using a unified interface.
 * Supports OpenAI-compatible APIs (OpenAI, DeepSeek, Google Gemini, Ollama)
 * and Anthropic's Messages API.
 */

import { sanitizeJsonString } from "../utils/sanitizeJson.js";

/* ───────────────────────── Provider Registry ───────────────────────────── */

const PROVIDER_REGISTRY = {
  openai: {
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1/chat/completions",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    authType: "bearer",
    openaiCompatible: true,
  },
  deepseek: {
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1/chat/completions",
    models: ["deepseek-chat", "deepseek-reasoner"],
    authType: "bearer",
    openaiCompatible: true,
  },
  anthropic: {
    name: "Anthropic",
    baseUrl: "https://api.anthropic.com/v1/messages",
    models: [
      "claude-3-5-sonnet-20241022",
      "claude-3-opus-20240229",
      "claude-3-haiku-20240307",
    ],
    authType: "anthropic",
    openaiCompatible: false,
  },
  google: {
    name: "Google Gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    models: [
      "gemini-1.5-pro-latest",
      "gemini-1.5-flash-latest",
      "gemini-2.0-flash-exp",
    ],
    authType: "bearer",
    openaiCompatible: true,
  },
  ollama: {
    name: "Ollama (Local)",
    baseUrl: "http://localhost:11434/v1/chat/completions",
    models: ["llama3.2", "llama3.1", "mistral", "phi4"],
    authType: "none",
    openaiCompatible: true,
  },
};

// Legacy env-based DeepSeek fallback
const LEGACY_DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const LEGACY_DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";
const LEGACY_DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

/* ───────────────────────── System Prompts ──────────────────────────────── */

const SYSTEM_PROMPT = `You are TubeDigest, an expert educator and knowledge distiller. Your task is to analyze video transcripts and create beautifully structured, easy-to-understand summaries.

Your audience is smart but busy people who want to learn efficiently. Use:
- Simple, clear English (accessible to a 12-year-old)
- Concrete analogies that make abstract concepts tangible
- Vivid visual descriptions for mental imagery
- Actionable takeaways

IMPORTANT: Return ONLY valid JSON. No markdown code blocks, no explanations, no extra text before or after the JSON.

TIMESTAMPS: The transcript includes timestamps in [MM:SS] format. When summarizing, embed relevant timestamps in your output so users can jump to specific moments in the video. Use the format [MM:SS] or [H:MM:SS] inline in text.

Return this exact JSON structure:
{
  "tldr": "2-3 sentence ultra-concise summary of the entire video. Include one key timestamp [MM:SS] if there's a defining moment.",
  "simpleSummary": "A clear, easy-to-understand explanation in 3-4 short paragraphs. Use natural language. Explain as if teaching a curious friend. Break down complex ideas. Use paragraph breaks (double newline) between sections. Embed relevant timestamps [MM:SS] when referencing specific moments or examples.",
  "deepSummary": "A comprehensive analysis with depth. Use ### Subheadings for each major topic covered in the video. Go into detail but remain accessible. Include nuances, context, and implications. 5-8 paragraphs with subheadings. Use paragraph breaks (double newline) between sections. Embed relevant timestamps [MM:SS] at the start of paragraphs or sections when referencing specific video moments.",
  "sections": [
    {
      "number": 1,
      "title": "Title of the section or list item",
      "summary": "1-2 sentence quick summary of what this section covers",
      "timestamp": "MM:SS — the approximate timestamp where this section begins in the video (optional but strongly encouraged)"
    }
  ],
  "analogies": [
    {
      "concept": "Name of the concept",
      "analogy": "A relatable, everyday analogy that makes this crystal clear",
      "visualDescription": "A vivid mental image the reader can picture in their mind. Use sensory details."
    }
  ],
  "keyTakeaways": [
    {
      "number": 1,
      "point": "The key insight or lesson. Include a relevant timestamp [MM:SS] if applicable.",
      "actionItem": "One concrete way to apply this knowledge"
    }
  ]
}

IMPORTANT: For the "sections" field — if the video presents a numbered list, ranking, steps, or distinct sections (e.g. "Top 5 ways...", "3 rules for...", "7 habits of..."), populate this array with one entry per item. If the video does NOT have numbered sections, return an empty array [].`;

const CHAT_SYSTEM_PROMPT = `You are TubeDigest, an expert teaching assistant. The user is asking follow-up questions about a YouTube video they just watched.

You have access to:
1. The FULL video transcript (every word spoken)
2. A structured summary of the video (TLDR, key takeaways, analogies, deep analysis)

Your job:
- Answer the user's question using ONLY the transcript and summary as your source of truth.
- Be concise but thorough. 2-4 short paragraphs is ideal.
- If the answer is not in the transcript or summary, say so honestly — do not hallucinate.
- Use simple, clear language.
- When relevant, reference specific ideas or moments from the video.
- Format your response with markdown for readability (bold, bullet points, etc.).`;

const SUGGEST_PROMPT = `You are TubeDigest. Based on the structured summary of a video, generate 3-4 thoughtful follow-up questions a curious viewer might ask.

Rules:
- Questions should be specific to the video's content (not generic).
- Cover different angles: clarifying a concept, practical application, deeper mechanism, or critical thinking.
- Keep each question under 15 words.
- Return ONLY valid JSON. No markdown, no extra text.

Return this exact JSON structure:
{
  "questions": [
    "First follow-up question?",
    "Second follow-up question?",
    "Third follow-up question?"
  ]
}`;

/* ───────────────────────── Exported Registry ───────────────────────────── */

export function getAvailableProviders() {
  return Object.entries(PROVIDER_REGISTRY).map(([id, config]) => ({
    id,
    name: config.name,
    models: config.models,
    requiresApiKey: config.authType !== "none",
  }));
}

/* ───────────────────────── Config Validation ───────────────────────────── */

export function checkProviderConfig(providerId, apiKey, model) {
  const provider = PROVIDER_REGISTRY[providerId];

  // Legacy fallback: if no provider specified but DeepSeek env is set, treat as deepseek
  if (!providerId && LEGACY_DEEPSEEK_API_KEY) {
    return { ok: true, provider: "deepseek", model: LEGACY_DEEPSEEK_MODEL, legacy: true };
  }

  if (!providerId) {
    return {
      ok: false,
      error: "No AI provider selected",
      fix: "Select a provider in settings and add your API key.",
    };
  }

  if (!provider) {
    return {
      ok: false,
      error: `Unknown provider: ${providerId}`,
      fix: "Choose a supported provider from the settings.",
    };
  }

  if (provider.authType !== "none" && !apiKey) {
    return {
      ok: false,
      error: `API key required for ${provider.name}`,
      fix: `Add your ${provider.name} API key in settings.`,
    };
  }

  const effectiveModel = model || provider.models[0];
  return { ok: true, provider: providerId, model: effectiveModel };
}

/* ───────────────────────── Request Builders ────────────────────────────── */

function buildHeaders(provider, apiKey) {
  const headers = { "Content-Type": "application/json" };
  if (provider.authType === "bearer" && apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  } else if (provider.authType === "anthropic" && apiKey) {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
  }
  return headers;
}

function buildOpenAICompatibleBody(model, messages, maxTokens, temperature, jsonMode = false) {
  const body = {
    model,
    messages,
    temperature: temperature ?? 0.7,
    max_tokens: maxTokens ?? 4000,
  };
  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }
  return body;
}

function buildAnthropicBody(model, system, messages, maxTokens, temperature) {
  // Anthropic uses top-level system param and requires max_tokens
  const userMessages = messages.filter((m) => m.role !== "system");
  return {
    model,
    system: system || undefined,
    messages: userMessages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    max_tokens: maxTokens ?? 4000,
    temperature: temperature ?? 0.7,
  };
}

/* ───────────────────────── Response Parsers ────────────────────────────── */

function parseOpenAICompatibleResponse(data) {
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from AI provider");
  return content;
}

function parseAnthropicResponse(data) {
  const content = data.content?.[0]?.text;
  if (!content) throw new Error("Empty response from Anthropic");
  return content;
}

/* ───────────────────────── Error Handlers ──────────────────────────────── */

function handleProviderError(response, errorText, providerName) {
  let errorData;
  try {
    errorData = JSON.parse(errorText);
  } catch {
    errorData = { error: { message: errorText } };
  }

  const message = errorData.error?.message || errorData.message || errorText;

  if (response.status === 401) {
    throw new Error(`Invalid API key for ${providerName}. Please check your API key in settings.`);
  }
  if (response.status === 429) {
    throw new Error(`Rate limit exceeded for ${providerName}. Please wait a moment and try again.`);
  }
  if (response.status === 402 || response.status === 403) {
    throw new Error(`Insufficient balance or access denied for ${providerName}. Please check your account.`);
  }

  throw new Error(`${providerName} API error (${response.status}): ${message}`);
}

/* ───────────────────────── Core API Call ───────────────────────────────── */

async function callProvider(providerId, apiKey, model, messages, maxTokens, temperature, jsonMode = false) {
  const provider = PROVIDER_REGISTRY[providerId];
  if (!provider) throw new Error(`Unknown provider: ${providerId}`);

  // Determine effective API key and base URL
  let effectiveApiKey = apiKey;
  let baseUrl = provider.baseUrl;

  // Legacy fallback for DeepSeek env vars
  if (providerId === "deepseek" && !effectiveApiKey && LEGACY_DEEPSEEK_API_KEY) {
    effectiveApiKey = LEGACY_DEEPSEEK_API_KEY;
    baseUrl = LEGACY_DEEPSEEK_API_URL;
  }

  const headers = buildHeaders(provider, effectiveApiKey);
  let body;

  if (provider.openaiCompatible) {
    body = buildOpenAICompatibleBody(model, messages, maxTokens, temperature, jsonMode);
  } else if (providerId === "anthropic") {
    const systemMsg = messages.find((m) => m.role === "system");
    body = buildAnthropicBody(model, systemMsg?.content, messages, maxTokens, temperature);
  }

  const response = await fetch(baseUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    handleProviderError(response, errorText, provider.name);
  }

  const data = await response.json();

  let content;
  if (provider.openaiCompatible) {
    content = parseOpenAICompatibleResponse(data);
  } else if (providerId === "anthropic") {
    content = parseAnthropicResponse(data);
  }

  return content;
}

/* ───────────────────────── Public API ──────────────────────────────────── */

export async function summarizeWithProvider(providerId, apiKey, model, transcript, videoInfo = {}) {
  const config = checkProviderConfig(providerId, apiKey, model);
  if (!config.ok) throw new Error(config.error);

  const effectiveProvider = config.provider;
  const effectiveModel = config.model;

  // Truncate very long transcripts to fit within token limits
  const maxChars = 30000; // ~10K tokens roughly
  const trimmedTranscript =
    transcript.length > maxChars
      ? transcript.substring(0, maxChars) + "\n\n[Transcript truncated due to length...]"
      : transcript;

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Here is the video transcript. Please analyze it and return the structured JSON summary.\n\nVideo Title: ${videoInfo.title || "Unknown"}\nChannel: ${videoInfo.channel || "Unknown"}\n\nTranscript:\n${trimmedTranscript}`,
    },
  ];

  // Ollama's OpenAI compat may not support response_format, so disable JSON mode for it
  const jsonMode = effectiveProvider !== "ollama";
  const content = await callProvider(effectiveProvider, apiKey, effectiveModel, messages, 4000, 0.7, jsonMode);

  // Parse JSON response
  let parsed;
  try {
    parsed = JSON.parse(sanitizeJsonString(content));
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(sanitizeJsonString(jsonMatch[0]));
    } else {
      throw new Error("Could not parse AI response as JSON");
    }
  }

  return parsed;
}

export async function askQuestionWithProvider(
  providerId,
  apiKey,
  model,
  transcript,
  summary,
  question,
  history = []
) {
  const config = checkProviderConfig(providerId, apiKey, model);
  if (!config.ok) throw new Error(config.error);

  const effectiveProvider = config.provider;
  const effectiveModel = config.model;

  const maxChars = 30000;
  const trimmedTranscript =
    transcript.length > maxChars
      ? transcript.substring(0, maxChars) + "\n\n[Transcript truncated...]"
      : transcript;

  const summaryText = JSON.stringify(summary, null, 2);

  const messages = [
    { role: "system", content: CHAT_SYSTEM_PROMPT },
    {
      role: "user",
      content: `Here is the video transcript and summary. Use this as your only source of truth when answering questions.\n\n--- VIDEO TRANSCRIPT ---\n${trimmedTranscript}\n\n--- STRUCTURED SUMMARY ---\n${summaryText}\n\n--- END OF CONTEXT ---`,
    },
    ...history,
    { role: "user", content: question },
  ];

  const answer = await callProvider(effectiveProvider, apiKey, effectiveModel, messages, 2000, 0.7, false);
  return answer.trim();
}

export async function generateSuggestedQuestionsWithProvider(providerId, apiKey, model, summary) {
  const config = checkProviderConfig(providerId, apiKey, model);
  if (!config.ok) throw new Error(config.error);

  const effectiveProvider = config.provider;
  const effectiveModel = config.model;

  const messages = [
    { role: "system", content: SUGGEST_PROMPT },
    {
      role: "user",
      content: `Generate follow-up questions for this video summary:\n\n${JSON.stringify(summary, null, 2)}`,
    },
  ];

  const jsonMode = effectiveProvider !== "ollama";
  const content = await callProvider(effectiveProvider, apiKey, effectiveModel, messages, 500, 0.8, jsonMode);

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    else throw new Error("Could not parse suggested questions");
  }

  return Array.isArray(parsed.questions) ? parsed.questions : [];
}
