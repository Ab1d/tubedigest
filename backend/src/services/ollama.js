/**
 * Ollama Service
 * Handles communication with locally-running Ollama LLM instance
 */

import { sanitizeJsonString } from "../utils/sanitizeJson.js";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

const SYSTEM_PROMPT = `You are TubeDigest, an expert educator and knowledge distiller. Your task is to analyze video transcripts and create beautifully structured, easy-to-understand summaries.

Your audience is smart but busy people who want to learn efficiently. Use:
- Simple, clear English (accessible to a 12-year-old)
- Concrete analogies that make abstract concepts tangible
- Vivid visual descriptions for mental imagery
- Actionable takeaways

IMPORTANT: Return ONLY valid JSON. No markdown code blocks, no explanations, no extra text.

Return this exact JSON structure:
{
  "tldr": "2-3 sentence ultra-concise summary of the entire video. Capture the core message.",
  "simpleSummary": "A clear, easy-to-understand explanation in 3-4 short paragraphs. Use natural language. Explain as if teaching a curious friend. Break down complex ideas.",
  "deepSummary": "A comprehensive analysis with depth. Use ### headings for subsections covering each major topic. Go into detail but remain accessible. Include nuances, context, and implications. 5-8 paragraphs with subheadings.",
  "sections": [
    {
      "number": 1,
      "title": "Title of the section or list item",
      "summary": "1-2 sentence quick summary of what this section covers"
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
      "point": "The key insight or lesson",
      "actionItem": "One concrete way to apply this knowledge"
    }
  ]
}

IMPORTANT: For the "sections" field — if the video presents a numbered list, ranking, steps, or distinct sections (e.g. "Top 5 ways...", "3 rules for...", "7 habits of..."), populate this array with one entry per item. If the video does NOT have numbered sections, return an empty array [].;

/**
 * Check if Ollama is running and the model is available
 */
export async function checkOllamaStatus() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, { method: "GET" });
    if (!response.ok) return { ok: false, error: "Ollama not responding" };

    const data = await response.json();
    const models = data.models || [];
    const hasModel = models.some((m) => m.name.includes(OLLAMA_MODEL));

    if (!hasModel) {
      return {
        ok: false,
        error: `Model "${OLLAMA_MODEL}" not found. Run: ollama pull ${OLLAMA_MODEL}`,
        availableModels: models.map((m) => m.name),
      };
    }

    return { ok: true, model: OLLAMA_MODEL };
  } catch (err) {
    return {
      ok: false,
      error: `Cannot connect to Ollama at ${OLLAMA_URL}. Is it running?`,
    };
  }
}

/**
 * Send transcript to Ollama and get structured summary
 */
export async function summarizeWithOllama(transcript) {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: `${SYSTEM_PROMPT}\n\nNow analyze this video transcript:\n\n${transcript}`,
      system: SYSTEM_PROMPT,
      stream: false,
      format: "json",
      options: {
        temperature: 0.7,
        num_predict: 4000,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  // Ollama returns the JSON inside the response field when using format: "json"
  let parsed;
  try {
    parsed = JSON.parse(sanitizeJsonString(data.response));
  } catch {
    // Fallback: try to extract JSON from the text response
    const jsonMatch = data.response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(sanitizeJsonString(jsonMatch[0]));
    } else {
      throw new Error("Could not parse LLM response as JSON");
    }
  }

  return parsed;
}
