import { ensureDatabase, getD1 } from "../../../../db/d1";
import { isAdmin } from "../../../../lib/auth";

export async function GET(request: Request) {
  if (!await isAdmin(request)) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  await ensureDatabase();
  const db = getD1();
  const [submissions, questions, logistics, photos, inquiries, inquiryMessages] = await Promise.all([
    db.prepare("SELECT * FROM submissions ORDER BY completed_at DESC LIMIT 1000").all(),
    db.prepare("SELECT * FROM quiz_questions ORDER BY sort_order").all(),
    db.prepare("SELECT * FROM logistics_responses ORDER BY submitted_at DESC LIMIT 1000").all(),
    db.prepare("SELECT id, caption, file_name, uploaded_at FROM education_photos ORDER BY uploaded_at DESC LIMIT 1000").all(),
    db.prepare("SELECT id, public_code, category, title, status, created_at, updated_at FROM inquiries ORDER BY updated_at DESC LIMIT 1000").all(),
    db.prepare("SELECT id, inquiry_id, sender, content, created_at FROM inquiry_messages ORDER BY created_at ASC LIMIT 5000").all(),
  ]);
  return Response.json({ submissions: submissions.results.map((row) => ({
    id: row.id, name: row.name, organization: row.organization, employeeNumber: row.employee_number,
    cohort: row.cohort, score: row.score, total: row.total, valueType: row.value_type,
    values: JSON.parse(String(row.values_json || "[]")), strengths: JSON.parse(String(row.strengths_json || "[]")),
    visionText: row.vision_text, answers: JSON.parse(String(row.answers_json || "[]")), completedAt: row.completed_at,
  })), questions: questions.results.map((row) => ({
    id: row.id, type: row.type, category: row.category, question: row.question,
    options: JSON.parse(String(row.options_json)), correctIndex: row.correct_index,
    explanation: row.explanation, image: row.image, active: Boolean(row.active), sortOrder: row.sort_order,
  })), logistics: logistics.results.map((row) => ({
    id: row.id, name: row.name, organization: row.organization,
    lodgingNeeded: row.lodging_needed, outboundMethod: row.outbound_method, returnMethod: row.return_method,
    note: row.note, submittedAt: row.submitted_at,
  })), photos: photos.results.map((row) => ({
    id: row.id, caption: row.caption, fileName: row.file_name, uploadedAt: row.uploaded_at,
  })), inquiries: inquiries.results.map((row) => ({
    id: row.id, code: row.public_code, category: row.category, title: row.title, status: row.status,
    createdAt: row.created_at, updatedAt: row.updated_at,
    messages: inquiryMessages.results.filter((message) => message.inquiry_id === row.id).map((message) => ({
      id: message.id, sender: message.sender, content: message.content, createdAt: message.created_at,
    })),
  })) });
}

export async function DELETE(request: Request) {
  if (!await isAdmin(request)) return Response.json({ error: "권한이 없습니다." }, { status: 401 });
  const { id } = await request.json() as { id?: string };
  if (!id) return Response.json({ error: "삭제할 기록이 없습니다." }, { status: 400 });
  await ensureDatabase();
  await getD1().prepare("DELETE FROM submissions WHERE id = ?").bind(id).run();
  return Response.json({ ok: true });
}

export async function PUT(request: Request) {
  if (!await isAdmin(request)) return Response.json({ error: "권한이 없습니다." }, { status: 401 });
  const payload = await request.json() as { id?: string; question?: string; category?: string; options?: string[]; correctIndex?: number | null; explanation?: string; active?: boolean };
  if (!payload.id || !payload.question || !Array.isArray(payload.options) || payload.options.length < 2) {
    return Response.json({ error: "문항 내용을 확인해주세요." }, { status: 400 });
  }
  await ensureDatabase();
  await getD1().prepare(`UPDATE quiz_questions SET question = ?, category = ?, options_json = ?, correct_index = ?, explanation = ?, active = ?, updated_at = ? WHERE id = ?`)
    .bind(payload.question.trim(), String(payload.category || "QUIZ").trim(), JSON.stringify(payload.options.map((option) => option.trim())), payload.correctIndex ?? null, String(payload.explanation || "").trim(), payload.active === false ? 0 : 1, new Date().toISOString(), payload.id).run();
  return Response.json({ ok: true });
}
