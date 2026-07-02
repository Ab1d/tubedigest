/**
 * User identity service
 *
 * TubeDigest has no login flow. Each browser gets an anonymous token that is
 * stored in localStorage and sent to the backend as the X-User-Id header. This
 * isolates each visitor's summary history on shared deployments.
 */

const USER_ID_KEY = "tubedigest_user_id";

function generateUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // fall through
    }
  }

  // Lightweight fallback for environments without crypto.randomUUID
  const seg = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .slice(1);
  return `${seg()}${seg()}-${seg()}-4${seg().slice(0, 3)}-${seg().slice(0, 4)}-${seg()}${seg()}${seg()}`;
}

export function getUserId(): string {
  try {
    let id = localStorage.getItem(USER_ID_KEY);
    if (!id) {
      id = generateUuid();
      localStorage.setItem(USER_ID_KEY, id);
    }
    return id;
  } catch {
    // localStorage may be unavailable (private mode, etc.)
    return "";
  }
}

export function clearUserId(): void {
  try {
    localStorage.removeItem(USER_ID_KEY);
  } catch {
    // ignore
  }
}
