import { ensureDatabase, getD1 } from "../../../db/d1";

export async function GET() {
  try {
    await ensureDatabase();
    const db = getD1();
    const countRow = await db.prepare("SELECT COUNT(*) AS count FROM submissions").first<{ count: number }>();
    const count = Number(countRow?.count || 0);
    if (count < 10) return Response.json({ published: false, count, remaining: 10 - count });
    const values = await db.prepare("SELECT value_type AS valueType, COUNT(*) AS count FROM submissions GROUP BY value_type ORDER BY count DESC").all();
    const rows = await db.prepare("SELECT answers_json FROM submissions").all();
    const rates: Record<string, { correct: number; total: number }> = {};
    rows.results.forEach((row) => {
      try {
        const answers = JSON.parse(String(row.answers_json)) as Array<{ questionId: string; correct: boolean | null }>;
        answers.forEach((answer) => {
          if (answer.correct === null) return;
          rates[answer.questionId] ||= { correct: 0, total: 0 };
          rates[answer.questionId].total += 1;
          if (answer.correct) rates[answer.questionId].correct += 1;
        });
      } catch { /* skip malformed legacy rows */ }
    });
    return Response.json({ published: true, count, values: values.results, rates });
  } catch {
    return Response.json({ published: false, count: 0, remaining: 10 });
  }
}
