import { ensureDatabase, getD1 } from "../../../db/d1";
import { createInquiryCode, createInquiryToken, hashInquiryToken } from "../../../lib/inquiry";

const CATEGORIES = new Set(["교육 일정", "이동·숙박", "준비사항", "홈페이지 이용", "기타"]);

export async function POST(request: Request) {
  const body = await request.json() as Record<string, unknown>;
  const category = String(body.category || "").trim();
  const title = String(body.title || "").trim();
  const content = String(body.content || "").trim();
  if (!CATEGORIES.has(category) || title.length < 2 || title.length > 100 || content.length < 5 || content.length > 3000) {
    return Response.json({ error: "문의 유형, 제목과 문의 내용을 확인해 주세요." }, { status: 400 });
  }

  await ensureDatabase();
  const db = getD1();
  const id = crypto.randomUUID();
  let code = "";
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = createInquiryCode();
    const exists = await db.prepare("SELECT id FROM inquiries WHERE public_code = ?").bind(candidate).first();
    if (!exists) { code = candidate; break; }
  }
  if (!code) return Response.json({ error: "문의 번호를 발급하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 503 });
  const token = createInquiryToken();
  const tokenHash = await hashInquiryToken(token);
  const now = new Date().toISOString();
  await db.batch([
    db.prepare(`INSERT INTO inquiries
      (id, public_code, token_hash, category, title, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'open', ?, ?)`).bind(id, code, tokenHash, category, title, now, now),
    db.prepare(`INSERT INTO inquiry_messages
      (id, inquiry_id, sender, content, created_at) VALUES (?, ?, 'visitor', ?, ?)`)
      .bind(crypto.randomUUID(), id, content, now),
  ]);
  return Response.json({ ok: true, code, token });
}
