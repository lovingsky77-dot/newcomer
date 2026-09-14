import { env } from "cloudflare:workers";
import { ensureDatabase, getD1 } from "../../../db/d1";

const MAX_FILES = 10;
const MAX_SIZE = 15 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

function getMedia(): R2Bucket {
  const media = (env as unknown as { MEDIA?: R2Bucket }).MEDIA;
  if (!media) throw new Error("사진 저장소 연결을 찾을 수 없습니다.");
  return media;
}

export async function GET() {
  await ensureDatabase();
  const result = await getD1().prepare(`SELECT id, caption, file_name, uploaded_at
    FROM education_photos ORDER BY uploaded_at DESC LIMIT 100`).all();
  return Response.json({ photos: result.results.map((row) => ({
    id: row.id,
    caption: row.caption,
    fileName: row.file_name,
    uploadedAt: row.uploaded_at,
    url: `/api/photos/${row.id}`,
  })) });
}

export async function POST(request: Request) {
  try {
  const form = await request.formData();
  const caption = String(form.get("caption") || "").trim().slice(0, 120);
  const files = form.getAll("photos").filter((item): item is File => item instanceof File && item.size > 0);
  if (!files.length || files.length > MAX_FILES) {
    return Response.json({ error: "사진은 한 번에 1~10장 업로드할 수 있습니다." }, { status: 400 });
  }
  if (files.some((file) => file.size > MAX_SIZE || !ALLOWED_TYPES.has(file.type))) {
    return Response.json({ error: "JPG, PNG, WEBP, HEIC 이미지만 파일당 15MB까지 업로드할 수 있습니다." }, { status: 400 });
  }

  await ensureDatabase();
  const db = getD1();
  const media = getMedia();
  const uploadedAt = new Date().toISOString();
  const uploaded: string[] = [];

  for (const file of files) {
    const id = crypto.randomUUID();
    const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8) || "img";
    const objectKey = `education/2026-fall/${id}.${extension}`;
    await media.put(objectKey, file.stream(), { httpMetadata: { contentType: file.type } });
    await db.prepare(`INSERT INTO education_photos
      (id, object_key, content_type, file_name, caption, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(id, objectKey, file.type, file.name.slice(0, 180), caption, uploadedAt).run();
    uploaded.push(id);
  }

  return Response.json({ ok: true, uploaded });
  } catch (error) {
    console.error("[photos] upload failed", error);
    return Response.json({ error: "사진 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." }, { status: 503 });
  }
}
