/**
 * Local AI Service
 * Connects to the local TubeDigest backend (Express + configurable AI provider)
 * Throws an error if the backend is unavailable
 */

import {
  validateYouTubeUrl as mockValidateUrl,
  generateMockHistory,
  fetchYouTubeMetadata,
} from "./mockAIService";
import type { SummaryData } from "./mockAIService";
import { loadActiveProvider, withProviderCredentials } from "./aiProviderService";
import { getUserId } from "./userService";

export type { SummaryData };
export { generateMockHistory, fetchYouTubeMetadata };

/**
 * History API
 */
export async function fetchHistory(): Promise<SummaryData[]> {
  try {
    const response = await fetch(`${API_BASE}/api/history`, {
      headers: apiHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function searchHistory(query: string): Promise<SummaryData[]> {
  try {
    const response = await fetch(
      `${API_BASE}/api/history/search?q=${encodeURIComponent(query)}`,
      { headers: apiHeaders(), signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function clearHistory(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/history`, {
      method: "DELETE",
      headers: apiHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function deleteHistoryItem(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/history/${id}`, {
      method: "DELETE",
      headers: apiHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

const API_BASE = import.meta.env.PROD ? "" : (import.meta.env.VITE_API_URL || "http://localhost:3001");

function apiHeaders(contentType = false): Record<string, string> {
  const headers: Record<string, string> = { "X-User-Id": getUserId() };
  if (contentType) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
}

// Track if backend is available (checked on first request)
let backendAvailable: boolean | null = null;

/**
 * Check if local backend is running and an AI provider is configured
 */
export async function checkBackendStatus(): Promise<{
  ok: boolean;
  aiReady: boolean;
  model?: string;
  provider?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/health`, {
      method: "GET",
      headers: apiHeaders(),
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return { ok: false, aiReady: false };

    try {
      const active = loadActiveProvider();
      const query = active
        ? `?provider=${encodeURIComponent(active.provider)}&apiKey=${encodeURIComponent(active.apiKey)}&model=${encodeURIComponent(active.model)}`
        : "";
      const aiRes = await fetch(`${API_BASE}/api/summarize/status${query}`, {
        method: "GET",
        headers: apiHeaders(),
        signal: AbortSignal.timeout(3000),
      });
      const aiData = await aiRes.json();
      return {
        ok: true,
        aiReady: aiData.ok || false,
        model: aiData.model,
        provider: aiData.provider,
      };
    } catch {
      return { ok: true, aiReady: false };
    }
  } catch {
    return { ok: false, aiReady: false };
  }
}

/**
 * Validate YouTube URL
 */
export function validateYouTubeUrl(url: string): boolean {
  return mockValidateUrl(url);
}

/**
 * Extract video ID from URL
 */
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/shorts\/([^&\s?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Get video thumbnail from YouTube
 */
function getVideoThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

/**
 * Format seconds into a readable duration string (MM:SS or H:MM:SS)
 */
function formatDuration(totalSeconds: number): string {
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
 * Transform backend summary response to frontend SummaryData format
 */
function transformBackendResponse(
  backendSummary: Record<string, unknown>,
  videoUrl: string,
  videoId: string,
  meta?: { durationSeconds?: number }
): SummaryData {
  const sectionsRaw = (backendSummary.sections as Array<Record<string, unknown>>) || [];
  const sections = sectionsRaw.map((s) => ({
    number: Number(s.number) || 0,
    title: String(s.title || ""),
    summary: String(s.summary || ""),
    timestamp: s.timestamp ? String(s.timestamp) : undefined,
  }));

  const analogiesRaw = (backendSummary.analogies as Array<Record<string, string>>) || [];
  const analogies = analogiesRaw.map((a) => ({
    concept: a.concept || "Concept",
    analogy: a.analogy || "",
    visual: a.visualDescription || a.visual || "",
  }));

  const takeawaysRaw = (backendSummary.keyTakeaways as Array<Record<string, unknown>>) || [];
  const keyTakeaways: string[] = takeawaysRaw.map(
    (t) => `${t.number ? `${t.number}. ` : ""}${t.point || ""}${t.actionItem ? ` — ${t.actionItem}` : ""}`
  );

  // Ensure arrays for simple/deep summary
  const simpleSummary = backendSummary.simpleSummary;
  const simpleSummaryArr: string[] =
    typeof simpleSummary === "string"
      ? simpleSummary.split("\n\n").filter(Boolean)
      : Array.isArray(simpleSummary)
        ? simpleSummary.map(String)
        : [String(simpleSummary)];

  const deepSummary = backendSummary.deepSummary;
  const deepSummaryArr: string[] =
    typeof deepSummary === "string"
      ? deepSummary.split("\n\n").filter(Boolean)
      : Array.isArray(deepSummary)
        ? deepSummary.map(String)
        : [String(deepSummary)];

  return {
    id: `local-${Date.now()}`,
    videoUrl,
    videoId,
    videoTitle: "YouTube Video",
    channelName: "YouTube Channel",
    duration: formatDuration(meta?.durationSeconds || 0),
    thumbnailUrl: getVideoThumbnail(videoId),
    summary: {
      tldr: String(backendSummary.tldr || ""),
      simpleSummary: simpleSummaryArr.length > 0 ? simpleSummaryArr : ["No summary available."],
      deepSummary: deepSummaryArr.length > 0 ? deepSummaryArr : ["No detailed summary available."],
      sections: sections.length > 0 ? sections : [],
      analogies,
      keyTakeaways: keyTakeaways.length > 0 ? keyTakeaways : ["No key takeaways available."],
    },
    createdAt: new Date().toISOString(),
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Chat / Q&A                                                               */
/* ────────────────────────────────────────────────────────────────────────── */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Ask a follow-up question about a video.
 * Requires the backend to be running.
 */
export async function askQuestion(
  url: string,
  summary: SummaryData["summary"],
  question: string,
  history: ChatMessage[] = []
): Promise<string> {
  const response = await fetch(`${API_BASE}/api/chat/ask`, {
    method: "POST",
    headers: apiHeaders(true),
    body: JSON.stringify(withProviderCredentials({ url, summary, question, history })),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.success || !data.answer) {
    throw new Error("Invalid response from chat service");
  }
  return data.answer;
}

/**
 * Generate suggested follow-up questions.
 * Requires the backend to be running.
 */
export async function generateSuggestedQuestions(
  summary: SummaryData["summary"]
): Promise<string[]> {
  const response = await fetch(`${API_BASE}/api/chat/suggest`, {
    method: "POST",
    headers: apiHeaders(true),
    body: JSON.stringify(withProviderCredentials({ summary })),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.success || !Array.isArray(data.questions)) {
    throw new Error("Invalid response from suggestion service");
  }
  return data.questions;
}

/**
 * Main function: Send URL to local backend, get back AI summary
 * Throws an error if the backend is unavailable
 */
export async function summarizeVideo(
  url: string,
  onProgress?: (step: string) => void
): Promise<SummaryData> {
  // Validate URL
  if (!validateYouTubeUrl(url)) {
    throw new Error(
      "Invalid YouTube URL. Supported formats:\n" +
        "• https://youtube.com/watch?v=VIDEO_ID\n" +
        "• https://youtu.be/VIDEO_ID\n" +
        "• https://youtube.com/shorts/VIDEO_ID"
    );
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("Could not extract video ID from URL");
  }

  // Check backend availability (only once per session)
  if (backendAvailable === null) {
    onProgress?.("Checking local backend...");
    const status = await checkBackendStatus();
    backendAvailable = status.ok && status.aiReady;
  }

  // If backend is not available, throw an error
  if (!backendAvailable) {
    throw new Error(
      "Backend not connected. Please start the TubeDigest backend and configure an AI provider in settings."
    );
  }

  // Backend is available — call it
  try {
    onProgress?.("Extracting YouTube transcript...");

    const response = await fetch(`${API_BASE}/api/summarize`, {
      method: "POST",
      headers: apiHeaders(true),
      body: JSON.stringify(withProviderCredentials({ url })),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg =
        errorData.error || errorData.details || `Server error: ${response.status}`;

      // If it's an AI provider config issue, throw an error
      if (errorMsg.includes("not configured") || errorMsg.includes("API key") || response.status === 503) {
        backendAvailable = false;
        throw new Error(
          "AI provider not configured. Please configure an AI provider in settings."
        );
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();

    if (!data.success || !data.summary) {
      throw new Error("Invalid response from backend");
    }

    onProgress?.("Processing summary...");

    return transformBackendResponse(data.summary, url, videoId, data.meta);
  } catch (err) {
    // Network error or other issue — throw an error
    if (err instanceof TypeError && err.message.includes("fetch")) {
      backendAvailable = false;
      throw new Error(
        "Backend unreachable. Please make sure the TubeDigest backend is running."
      );
    }
    throw err;
  }
}
