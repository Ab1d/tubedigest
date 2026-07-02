/**
 * Transcript Service
 * Extracts transcripts from YouTube videos
 */

import { YoutubeTranscript } from "youtube-transcript";

/**
 * Extract video ID from various YouTube URL formats
 */
function extractVideoId(url) {
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
 * Validate YouTube URL format
 */
export function validateYouTubeUrl(url) {
  return extractVideoId(url) !== null;
}

/**
 * Fetch actual video duration from YouTube watch page.
 * Parses lengthSeconds from ytInitialPlayerResponse.
 */
async function fetchVideoDuration(videoId) {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    const html = await res.text();
    const match = html.match(/"lengthSeconds"\s*:\s*"(\d+)"/);
    if (match) return parseInt(match[1], 10);
  } catch (err) {
    console.warn(`[Transcript] Could not fetch duration for ${videoId}:`, err.message);
  }
  return 0;
}

/**
 * Format seconds as [MM:SS] or [H:MM:SS]
 */
function formatTimestamp(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

/**
 * Fetch transcript for a YouTube video
 */
export async function fetchTranscript(url) {
  const videoId = extractVideoId(url);

  if (!videoId) {
    throw new Error(
      "Invalid YouTube URL. Supported formats:\n" +
        "• https://youtube.com/watch?v=VIDEO_ID\n" +
        "• https://youtu.be/VIDEO_ID\n" +
        "• https://youtube.com/shorts/VIDEO_ID"
    );
  }

  try {
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "en",
    });

    if (!transcriptItems || transcriptItems.length === 0) {
      throw new Error(
        "No transcript found for this video.\n" +
          "This may happen if:\n" +
          "• The video has no captions/subtitles\n" +
          "• Auto-generated captions are disabled\n" +
          "• The video is private or region-restricted"
      );
    }

    const fullText = transcriptItems.map((item) => item.text).join(" ");

    // Build timestamped transcript for AI reference
    const timestampedTranscript = transcriptItems
      .map((item) => `[${formatTimestamp(item.offset)}] ${item.text}`)
      .join("\n");

    // Fetch real video duration from the watch page (more reliable than transcript timestamps)
    let durationSeconds = await fetchVideoDuration(videoId);

    // Fallback: estimate from transcript if watch-page fetch failed
    if (!durationSeconds && transcriptItems.length > 0) {
      const last = transcriptItems[transcriptItems.length - 1];
      const raw = last.offset + (last.duration || 0);
      // youtube-transcript may return ms (srv3) or seconds (classic)
      durationSeconds = raw > 100000 ? Math.round(raw / 1000) : Math.round(raw);
    }

    return {
      videoId,
      transcript: fullText,
      timestampedTranscript,
      segments: transcriptItems.length,
      durationSeconds,
      wordCount: fullText.split(/\s+/).length,
    };
  } catch (error) {
    if (error.message.includes("Transcript is disabled")) {
      throw new Error(
        "Transcripts are disabled for this video.\n" +
          "Try a different video that has captions enabled."
      );
    }
    throw error;
  }
}
