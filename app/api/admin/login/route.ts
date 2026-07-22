import { adminEmail, authConfigured, createAdminCookie, verifyPassword } from "../../../../lib/auth";

export async function GET() {
  return Response.json({ configured: authConfigured() });
}

export async function POST(request: Request) {
  if (!authConfigured()) return Response.json({ error: "관리자 인증이 아직 설정되지 않았습니다." }, { status: 503 });
  const payload = await request.json() as { email?: string; password?: string };
  const email = String(payload.email || "").trim().toLowerCase();
  const valid = email === adminEmail() && await verifyPassword(String(payload.password || ""));
  if (!valid) return Response.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json", "set-cookie": await createAdminCookie(email) } });
}
