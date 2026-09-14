import { env } from "cloudflare:workers";
import { ensureDatabase, getD1 } from "../../../../db/d1";

const CHUNK_SIZE = 512 * 1024;
const MAX_SIZE = 15 * 1024 * 1024;
const TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
type Upload = { name: string; type: string; size: number; caption: string; count: number; createdAt: number };
function media() { return (env as unknown as { MEDIA: R2Bucket }).MEDIA; }
function prefix(id: string) { return `photo-uploads/${id}`; }
async function clearUpload(id: string, count: number) {
  await media().delete([`${prefix(id)}/manifest`, ...Array.from({ length: count }, (_, i) => `${prefix(id)}/${i}`)]);
}
async function readUpload(request: Request) {
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!/^[a-f0-9-]{36}$/.test(id)) return null;
  const object = await media().get(`${prefix(id)}/manifest`);
  if (!object) return null;
  const upload = await object.json<Upload>();
  if (Date.now() - upload.createdAt > 3600000) { await clearUpload(id, upload.count); return null; }
  return { id, upload };
}
function failed(error: unknown) {
  console.error("[photos] chunk upload failed", error);
  return Response.json({ error: "사진 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." }, { status: 503 });
}

export async function POST(request: Request) {
  try {
    const data = await request.json() as Partial<Upload>;
    if (!Number.isSafeInteger(data.size) || !data.size || data.size > MAX_SIZE || data.size < 1 || !TYPES.has(data.type || "")) {
      return Response.json({ error: "JPG, PNG, WEBP, HEIC 이미지만 파일당 15MB까지 업로드할 수 있습니다." }, { status: 400 });
    }
    const id = crypto.randomUUID();
    const upload: Upload = { name: String(data.name || "photo").slice(0, 180), type: data.type!, size: data.size,
      caption: String(data.caption || "").trim().slice(0, 120), count: Math.ceil(data.size / CHUNK_SIZE), createdAt: Date.now() };
    await media().put(`${prefix(id)}/manifest`, JSON.stringify(upload));
    return Response.json({ ok: true, id, chunkSize: CHUNK_SIZE });
  } catch (error) { return failed(error); }
}

export async function PUT(request: Request) {
  try {
    const session = await readUpload(request);
    if (!session) return Response.json({ error: "업로드 시간이 만료되었습니다. 다시 시도해 주세요." }, { status: 404 });
    const { id, upload } = session;
    const rawIndex = new URL(request.url).searchParams.get("index");
    const index = rawIndex === null ? -1 : Number(rawIndex);
    if (!Number.isInteger(index) || index < 0 || index >= upload.count) return Response.json({ error: "잘못된 사진 조각입니다." }, { status: 400 });
    const bytes = await request.arrayBuffer();
    const expected = Math.min(CHUNK_SIZE, upload.size - index * CHUNK_SIZE);
    if (bytes.byteLength !== expected) return Response.json({ error: "사진 전송이 완료되지 않았습니다. 다시 시도해 주세요." }, { status: 400 });
    await media().put(`${prefix(id)}/${index}`, bytes);
    return Response.json({ ok: true });
  } catch (error) { return failed(error); }
}

export async function PATCH(request: Request) {
  try {
    const session = await readUpload(request);
    if (!session) return Response.json({ error: "업로드 시간이 만료되었습니다. 다시 시도해 주세요." }, { status: 404 });
    const { id, upload } = session;
    await ensureDatabase();
    const existing = await getD1().prepare("SELECT id FROM education_photos WHERE id = ?").bind(id).first();
    if (existing) return Response.json({ ok: true, uploaded: [id] });
    const bytes = new Uint8Array(upload.size);
    for (let i = 0; i < upload.count; i++) {
      const part = await media().get(`${prefix(id)}/${i}`);
      if (!part) return Response.json({ error: "사진 일부가 전송되지 않았습니다. 다시 시도해 주세요." }, { status: 409 });
      bytes.set(new Uint8Array(await part.arrayBuffer()), i * CHUNK_SIZE);
    }
    const extension = upload.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8) || "img";
    const key = `education/2026-fall/${id}.${extension}`;
    await media().put(key, bytes, { httpMetadata: { contentType: upload.type } });
    await getD1().prepare(`INSERT OR IGNORE INTO education_photos
      (id, object_key, content_type, file_name, caption, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(id, key, upload.type, upload.name, upload.caption, new Date().toISOString()).run();
    return Response.json({ ok: true, uploaded: [id] });
  } catch (error) { return failed(error); }
}

export async function DELETE(request: Request) {
  try {
    const session = await readUpload(request);
    if (session) await clearUpload(session.id, session.upload.count);
    return Response.json({ ok: true });
  } catch (error) { return failed(error); }
}
