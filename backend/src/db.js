/**
 * Database layer
 * PostgreSQL connection, schema bootstrap, and query helpers.
 */

import pg from "pg";
const { Pool } = pg;

let pool = null;
let dbEnabled = false;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    pool.on("error", (err) => {
      console.error("Unexpected DB error", err);
    });
  }
  return pool;
}

/** Ensure tables and indexes exist. */
export async function initDb() {
  if (!process.env.DATABASE_URL) {
    console.warn(
      "[DB] DATABASE_URL not set. History features will be disabled.\n" +
        "       To enable: export DATABASE_URL=postgresql://user:pass@localhost:5432/tubedigest"
    );
    return;
  }

  try {
    const client = await getPool().connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS summaries (
          id SERIAL PRIMARY KEY,
          video_id VARCHAR(32) NOT NULL,
          video_url TEXT NOT NULL,
          video_title TEXT NOT NULL DEFAULT 'YouTube Video',
          channel_name TEXT NOT NULL DEFAULT 'YouTube Channel',
          duration TEXT,
          thumbnail_url TEXT,
          summary_json JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_summaries_created_at
        ON summaries (created_at DESC);
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_summaries_video_id
        ON summaries (video_id);
      `);

      dbEnabled = true;
      console.log("[DB] Connected and schema initialized");
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(
      "[DB] Could not connect to PostgreSQL. History features will be disabled.\n" +
        "       Error:", err.message, "\n" +
        "       Make sure PostgreSQL is running and DATABASE_URL is correct."
    );
    // Don't throw — let the server start without DB
  }
}

function checkDb() {
  if (!dbEnabled) throw new Error("Database not configured");
}

/** Insert a new summary record. */
export async function createSummary({
  videoId,
  videoUrl,
  videoTitle,
  channelName,
  duration,
  thumbnailUrl,
  summaryJson,
}) {
  checkDb();
  const { rows } = await getPool().query(
    `INSERT INTO summaries
       (video_id, video_url, video_title, channel_name, duration, thumbnail_url, summary_json)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [videoId, videoUrl, videoTitle, channelName, duration, thumbnailUrl, JSON.stringify(summaryJson)]
  );
  return rows[0];
}

/** List recent summaries (newest first). */
export async function listSummaries({ limit = 100, offset = 0 } = {}) {
  checkDb();
  const { rows } = await getPool().query(
    `SELECT * FROM summaries
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows;
}

/** Full-text search across title, channel, and summary content. */
export async function searchSummaries(query, { limit = 100 } = {}) {
  checkDb();
  const like = `%${query}%`;
  const { rows } = await getPool().query(
    `SELECT * FROM summaries
     WHERE video_title ILIKE $1
        OR channel_name ILIKE $1
        OR summary_json::text ILIKE $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [like, limit]
  );
  return rows;
}

/** Delete a single summary by id. */
export async function deleteSummary(id) {
  checkDb();
  const { rowCount } = await getPool().query(
    `DELETE FROM summaries WHERE id = $1`,
    [id]
  );
  return rowCount > 0;
}

/** Clear all summaries. */
export async function clearAllSummaries() {
  checkDb();
  await getPool().query(`DELETE FROM summaries`);
}

/** Convert a DB row to the shape the frontend expects. */
export function rowToSummary(row) {
  const s = row.summary_json;

  const sections = (s.sections || []).map((sec) => ({
    number: sec.number || 0,
    title: sec.title || "",
    summary: sec.summary || "",
    timestamp: sec.timestamp || undefined,
  }));

  const analogies = (s.analogies || []).map((a) => ({
    concept: a.concept || "Concept",
    analogy: a.analogy || "",
    visual: a.visualDescription || a.visual || "",
  }));

  const keyTakeaways = (s.keyTakeaways || []).map((t) =>
    `${t.number ? `${t.number}. ` : ""}${t.point || ""}${t.actionItem ? ` — ${t.actionItem}` : ""}`
  );

  const simpleSummary =
    typeof s.simpleSummary === "string"
      ? s.simpleSummary.split("\n\n").filter(Boolean)
      : Array.isArray(s.simpleSummary)
        ? s.simpleSummary.map(String)
        : [String(s.simpleSummary || "")];

  const deepSummary =
    typeof s.deepSummary === "string"
      ? s.deepSummary.split("\n\n").filter(Boolean)
      : Array.isArray(s.deepSummary)
        ? s.deepSummary.map(String)
        : [String(s.deepSummary || "")];

  return {
    id: String(row.id),
    videoUrl: row.video_url,
    videoTitle: row.video_title,
    channelName: row.channel_name,
    duration: row.duration || "--:--",
    thumbnailUrl: row.thumbnail_url,
    summary: {
      tldr: String(s.tldr || ""),
      simpleSummary: simpleSummary.length > 0 ? simpleSummary : ["No summary available."],
      deepSummary: deepSummary.length > 0 ? deepSummary : ["No detailed summary available."],
      sections: sections.length > 0 ? sections : [],
      analogies: analogies.length > 0 ? analogies : [],
      keyTakeaways: keyTakeaways.length > 0 ? keyTakeaways : ["No key takeaways available."],
    },
    createdAt: row.created_at,
  };
}
