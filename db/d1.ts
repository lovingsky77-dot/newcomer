import { env } from "cloudflare:workers";

export function getD1(): D1Database {
  const binding = (env as unknown as { DB?: D1Database }).DB;
  if (!binding) {
    throw new Error("데이터베이스 연결을 찾을 수 없습니다.");
  }
  return binding;
}

let schemaReady: Promise<void> | null = null;

export function ensureDatabase() {
  if (schemaReady) return schemaReady;
  const db = getD1();
  schemaReady = db
    .batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        organization TEXT NOT NULL,
        employee_number TEXT NOT NULL,
        cohort TEXT NOT NULL DEFAULT 'current',
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        value_type TEXT NOT NULL,
        values_json TEXT NOT NULL DEFAULT '[]',
        strengths_json TEXT NOT NULL DEFAULT '[]',
        vision_text TEXT NOT NULL DEFAULT '',
        answers_json TEXT NOT NULL,
        completed_at TEXT NOT NULL
      )`),
      db.prepare(`CREATE INDEX IF NOT EXISTS submissions_employee_idx
        ON submissions(employee_number, completed_at)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS quiz_questions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL DEFAULT 'knowledge',
        category TEXT NOT NULL,
        question TEXT NOT NULL,
        options_json TEXT NOT NULL,
        correct_index INTEGER,
        explanation TEXT NOT NULL DEFAULT '',
        image TEXT,
        active INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL,
        updated_at TEXT NOT NULL
      )`),
    ])
    .then(() => undefined)
    .catch((error) => {
      schemaReady = null;
      throw error;
    });
  return schemaReady;
}
