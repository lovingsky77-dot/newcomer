import { getD1 } from "../../../../db/d1";
import { findAuthorizedInquiry, inquiryThread } from "../../../../lib/inquiry";

export async function POST(request: Request) {
  const body = await request.json() as Record<string, unknown>;
  const code = String(body.code || "").trim().toUpperCase();
  const token = String(body.token || "").trim();
  const inquiry = await findAuthorizedInquiry(code, token);
  if (!inquiry) return Response.json({ error: "문의 번호 또는 복구 코드가 올바르지 않습니다." }, { status: 403 });

  const message = String(body.message || "").trim();
  if (message) {
    if (inquiry.status === "closed") return Response.json({ error: "종료된 문의에는 메시지를 추가할 수 없습니다." }, { status: 409 });
    if (message.length < 2 || message.length > 3000) return Response.json({ error: "메시지는 2~3,000자로 입력해 주세요." }, { status: 400 });
    const now = new Date().toISOString();
    const db = getD1();
    await db.batch([
      db.prepare(`INSERT INTO inquiry_messages
        (id, inquiry_id, sender, content, created_at) VALUES (?, ?, 'visitor', ?, ?)`)
        .bind(crypto.randomUUID(), inquiry.id, message, now),
      db.prepare("UPDATE inquiries SET status = 'open', updated_at = ? WHERE id = ?").bind(now, inquiry.id),
    ]);
    inquiry.status = "open";
    inquiry.updated_at = now;
  }

  return Response.json({ inquiry: {
    code: inquiry.public_code, category: inquiry.category, title: inquiry.title,
    status: inquiry.status, createdAt: inquiry.created_at, updatedAt: inquiry.updated_at,
    messages: await inquiryThread(String(inquiry.id)),
  } });
}
