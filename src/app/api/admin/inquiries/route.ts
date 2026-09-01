import { ensureDatabase, getD1 } from "../../../../db/d1";
import { isAdmin } from "../../../../lib/auth";

export async function POST(request: Request) {
  if (!await isAdmin(request)) return Response.json({ error: "권한이 없습니다." }, { status: 401 });
  const body = await request.json() as { inquiryId?: string; message?: string };
  const inquiryId = String(body.inquiryId || "");
  const message = String(body.message || "").trim();
  if (!inquiryId || message.length < 2 || message.length > 3000) return Response.json({ error: "답변 내용을 확인해 주세요." }, { status: 400 });
  await ensureDatabase();
  const db = getD1();
  const exists = await db.prepare("SELECT id FROM inquiries WHERE id = ?").bind(inquiryId).first();
  if (!exists) return Response.json({ error: "문의를 찾을 수 없습니다." }, { status: 404 });
  const now = new Date().toISOString();
  await db.batch([
    db.prepare(`INSERT INTO inquiry_messages
      (id, inquiry_id, sender, content, created_at) VALUES (?, ?, 'admin', ?, ?)`)
      .bind(crypto.randomUUID(), inquiryId, message, now),
    db.prepare("UPDATE inquiries SET status = 'answered', updated_at = ? WHERE id = ?").bind(now, inquiryId),
  ]);
  return Response.json({ ok: true });
}

export async function PATCH(request: Request) {
  if (!await isAdmin(request)) return Response.json({ error: "권한이 없습니다." }, { status: 401 });
  const body = await request.json() as { inquiryId?: string; status?: string };
  const status = body.status === "closed" ? "closed" : "open";
  if (!body.inquiryId) return Response.json({ error: "문의를 찾을 수 없습니다." }, { status: 400 });
  await ensureDatabase();
  await getD1().prepare("UPDATE inquiries SET status = ?, updated_at = ? WHERE id = ?")
    .bind(status, new Date().toISOString(), body.inquiryId).run();
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!await isAdmin(request)) return Response.json({ error: "권한이 없습니다." }, { status: 401 });
  const body = await request.json() as { inquiryId?: string };
  if (!body.inquiryId) return Response.json({ error: "문의를 찾을 수 없습니다." }, { status: 400 });
  await ensureDatabase();
  const db = getD1();
  await db.batch([
    db.prepare("DELETE FROM inquiry_messages WHERE inquiry_id = ?").bind(body.inquiryId),
    db.prepare("DELETE FROM inquiries WHERE id = ?").bind(body.inquiryId),
  ]);
  return Response.json({ ok: true });
}
