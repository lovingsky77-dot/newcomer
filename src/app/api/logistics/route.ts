import { ensureDatabase, getD1 } from "../../../db/d1";

const DEADLINE = new Date("2026-09-13T23:59:59+09:00").getTime();

export async function POST(request: Request) {
  if (Date.now() > DEADLINE) {
    return Response.json({ error: "숙박·이동 조사가 마감되었습니다." }, { status: 410 });
  }

  const body = await request.json() as Record<string, unknown>;
  const required = ["name", "organization", "lodgingNeeded", "outboundMethod", "returnMethod"];
  if (required.some((key) => !String(body[key] || "").trim())) {
    return Response.json({ error: "필수 항목을 모두 입력해 주세요." }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const submittedAt = new Date().toISOString();
  await ensureDatabase();
  await getD1().prepare(`INSERT INTO logistics_responses
    (id, name, organization, employee_number, lodging_needed, outbound_method, return_method, note, submitted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(
      id,
      String(body.name).trim().slice(0, 40),
      String(body.organization).trim().slice(0, 80),
      "",
      String(body.lodgingNeeded).trim().slice(0, 20),
      String(body.outboundMethod).trim().slice(0, 100),
      String(body.returnMethod).trim().slice(0, 100),
      String(body.note || "").trim().slice(0, 500),
      submittedAt,
    ).run();

  return Response.json({ ok: true, id, submittedAt });
}
