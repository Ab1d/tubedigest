/**
 * Sanitize raw JSON strings from LLMs.
 *
 * LLMs occasionally emit literal control characters (newlines, tabs, etc.)
 * inside JSON string values instead of the required escape sequences.
 * Standard JSON.parse rejects these. This helper walks the raw text,
 * identifies characters that are inside a string literal, and escapes
 * any bare control characters so the result is strict JSON.
 */
export function sanitizeJsonString(str) {
  let result = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const code = char.charCodeAt(0);

    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      result += char;
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }

    if (inString && code >= 0x00 && code <= 0x1f) {
      if (char === "\n") result += "\\n";
      else if (char === "\r") result += "\\r";
      else if (char === "\t") result += "\\t";
      else if (char === "\b") result += "\\b";
      else if (char === "\f") result += "\\f";
      else result += "\\u" + code.toString(16).padStart(4, "0");
      continue;
    }

    result += char;
  }

  return result;
}
