import { env } from "cloudflare:workers";
import { ensureDatabase, getD1 } from "../../../../db/d1";
import { isAdmin } from "../../../../lib/auth";

function getMedia(): R2Bucket {
  const media = (env as unknown as { MEDIA?: R2Bucket }).MEDIA;
  if (!media) throw new Error("사진 저장소 연결을 찾을 수 없습니다.");
  return media;
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin(request))) return Response.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });
  const { id } = await context.params;
  await ensureDatabase();
  const row = await getD1().prepare("SELECT object_key FROM education_photos WHERE id = ?").bind(id).first();
  if (!row) return Response.json({ error: "사진을 찾을 수 없습니다." }, { status: 404 });
  await getMedia().delete(String(row.object_key));
  await getD1().prepare("DELETE FROM education_photos WHERE id = ?").bind(id).run();
  return Response.json({ ok: true });
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await ensureDatabase();
  const row = await getD1().prepare("SELECT object_key, content_type FROM education_photos WHERE id = ?").bind(id).first();
  if (!row) return new Response("Not found", { status: 404 });
  const object = await getMedia().get(String(row.object_key));
  if (!object) return new Response("Not found", { status: 404 });
  return new Response(object.body, {
    headers: {
      "content-type": String(row.content_type || "application/octet-stream"),
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    },
  });
}
