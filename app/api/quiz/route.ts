import { defaultQuestions, type QuizQuestion } from "../../../lib/content";
import { ensureDatabase, getD1 } from "../../../db/d1";

async function seedQuestions() {
  await ensureDatabase();
  const db = getD1();
  const count = await db.prepare("SELECT COUNT(*) AS count FROM quiz_questions").first<{ count: number }>();
  if (Number(count?.count || 0) > 0) return;
  const now = new Date().toISOString();
  await db.batch(defaultQuestions.map((question) => db.prepare(`INSERT INTO quiz_questions
    (id, type, category, question, options_json, correct_index, explanation, image, active, sort_order, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`)
    .bind(question.id, question.type, question.category, question.question, JSON.stringify(question.options), question.correctIndex, question.explanation, question.image || null, question.sortOrder, now)));
}

export async function GET() {
  try {
    await seedQuestions();
    const result = await getD1().prepare(`SELECT id, type, category, question, options_json, correct_index,
      explanation, image, active, sort_order FROM quiz_questions WHERE active = 1 ORDER BY sort_order`).all();
    const questions = result.results.map((row) => ({
      id: String(row.id),
      type: row.type,
      category: row.category,
      question: row.question,
      options: JSON.parse(String(row.options_json)),
      correctIndex: row.correct_index === null ? null : Number(row.correct_index),
      explanation: row.explanation,
      image: row.image,
      active: Boolean(row.active),
      sortOrder: Number(row.sort_order),
    })) as QuizQuestion[];
    return Response.json({ questions });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "퀴즈를 불러오지 못했습니다." }, { status: 500 });
  }
}
