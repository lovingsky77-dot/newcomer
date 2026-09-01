import { ensureDatabase, getD1 } from "../db/d1";

export async function hashInquiryToken(token: string) {
  const normalized = /^\d{4}-?\d{4}$/.test(token) ? token.replace("-", "") : token;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalized));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function createInquiryToken() {
  const value = String(crypto.getRandomValues(new Uint32Array(1))[0] % 100_000_000).padStart(8, "0");
  return `${value.slice(0, 4)}-${value.slice(4)}`;
}

export function createInquiryCode() {
  const value = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0");
  return `Q-${value}`;
}

export async function findAuthorizedInquiry(code: string, token: string) {
  if (!/^Q-(?:[A-F0-9]{8}|\d{6})$/.test(code) || token.length < 8 || token.length > 80) return null;
  await ensureDatabase();
  const row = await getD1().prepare("SELECT * FROM inquiries WHERE public_code = ?").bind(code).first();
  if (!row) return null;
  const actual = await hashInquiryToken(token);
  const expected = String(row.token_hash || "");
  if (actual.length !== expected.length) return null;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) difference |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  return difference === 0 ? row : null;
}

export async function inquiryThread(inquiryId: string) {
  const result = await getD1().prepare(`SELECT id, sender, content, created_at
    FROM inquiry_messages WHERE inquiry_id = ? ORDER BY created_at ASC`).bind(inquiryId).all();
  return result.results.map((row) => ({ id: row.id, sender: row.sender, content: row.content, createdAt: row.created_at }));
}
