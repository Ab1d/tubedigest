/**
 * DeepSeek Service
 * Handles communication with DeepSeek API for AI summarization
 */

import { sanitizeJsonString } from "../utils/sanitizeJson.js";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

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

/**
 * Check if DeepSeek API key is configured
 */
export function checkDeepSeekConfig() {
  if (!DEEPSEEK_API_KEY) {
    return {
      ok: false,
      error: "DEEPSEEK_API_KEY not set",
      fix: "Set the DEEPSEEK_API_KEY environment variable. Get your key from https://platform.deepseek.com",
    };
  }
  return { ok: true, model: DEEPSEEK_MODEL };
}

/**
 * Send transcript to DeepSeek and get structured summary
 */
export async function summarizeWithDeepSeek(transcript, videoInfo = {}) {
  const config = checkDeepSeekConfig();
  if (!config.ok) {
    throw new Error(config.error);
  }

  // Truncate very long transcripts to fit within token limits
  // DeepSeek context window is 64K tokens, but we need room for the response
  const maxChars = 30000; // ~10K tokens roughly
  const trimmedTranscript =
    transcript.length > maxChars
      ? transcript.substring(0, maxChars) +
        "\n\n[Transcript truncated due to length...]"
      : transcript;

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Here is the video transcript. Please analyze it and return the structured JSON summary.

Video Title: ${videoInfo.title || "Unknown"}
Channel: ${videoInfo.channel || "Unknown"}

Transcript:
${trimmedTranscript}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { error: { message: errorText } };
    }

    // Handle specific DeepSeek errors
    if (response.status === 401) {
      throw new Error(
        "Invalid DeepSeek API key. Please check your DEEPSEEK_API_KEY. Get a new key at https://platform.deepseek.com"
      );
    }
    if (response.status === 429) {
      throw new Error(
        "Rate limit exceeded. Too many requests to DeepSeek API. Please wait a moment and try again."
      );
    }
    if (response.status === 402) {
      throw new Error(
        "Insufficient balance. Please add credit to your DeepSeek account at https://platform.deepseek.com"
      );
    }

    throw new Error(
      errorData.error?.message || `DeepSeek API error (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from DeepSeek API");
  }

  // Parse JSON response
  let parsed;
  try {
    parsed = JSON.parse(sanitizeJsonString(content));
  } catch {
    // Try to extract JSON from the response if there's extra text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(sanitizeJsonString(jsonMatch[0]));
    } else {
      throw new Error("Could not parse DeepSeek response as JSON");
    }
  }

  return parsed;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Chat / Q&A                                                               */
/* ────────────────────────────────────────────────────────────────────────── */

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

/**
 * Ask a follow-up question about a video.
 * @param {string} transcript — full video transcript
 * @param {object} summary — structured summary object
 * @param {string} question — user's question
 * @param {Array<{role:string, content:string}>} history — previous messages
 */
export async function askQuestionAboutVideo(transcript, summary, question, history = []) {
  const config = checkDeepSeekConfig();
  if (!config.ok) throw new Error(config.error);

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

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    let errorData;
    try { errorData = JSON.parse(errorText); } catch { errorData = { error: { message: errorText } }; }

    if (response.status === 401) throw new Error("Invalid DeepSeek API key.");
    if (response.status === 429) throw new Error("Rate limit exceeded. Please wait a moment.");
    if (response.status === 402) throw new Error("Insufficient balance. Please add credit.");
    throw new Error(errorData.error?.message || `DeepSeek API error (${response.status})`);
  }

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content;
  if (!answer) throw new Error("Empty response from DeepSeek API");
  return answer.trim();
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Suggested questions                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

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

/**
 * Generate suggested follow-up questions based on a summary.
 * @param {object} summary — structured summary object
 */
export async function generateSuggestedQuestions(summary) {
  const config = checkDeepSeekConfig();
  if (!config.ok) throw new Error(config.error);

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: "system", content: SUGGEST_PROMPT },
        {
          role: "user",
          content: `Generate follow-up questions for this video summary:\n\n${JSON.stringify(summary, null, 2)}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    let errorData;
    try { errorData = JSON.parse(errorText); } catch { errorData = { error: { message: errorText } }; }
    throw new Error(errorData.error?.message || `DeepSeek API error (${response.status})`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from DeepSeek API");

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
