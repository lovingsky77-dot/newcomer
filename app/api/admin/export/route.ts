import { ensureDatabase, getD1 } from "../../../../db/d1";
import { isAdmin } from "../../../../lib/auth";

const csv = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export async function GET(request: Request) {
  if (!await isAdmin(request)) return Response.json({ error: "권한이 없습니다." }, { status: 401 });
  await ensureDatabase();
  const result = await getD1().prepare("SELECT * FROM submissions ORDER BY completed_at DESC").all();
  const header = ["완료일시", "이름", "소속", "사번", "교육차수", "점수", "총점", "핵심가치유형", "선택가치", "강점", "Vision Map"];
  const lines = result.results.map((row) => [row.completed_at, row.name, row.organization, row.employee_number, row.cohort, row.score, row.total, row.value_type, JSON.parse(String(row.values_json || "[]")).join(" / "), JSON.parse(String(row.strengths_json || "[]")).join(" / "), row.vision_text].map(csv).join(","));
  return new Response(`\uFEFF${header.map(csv).join(",")}\n${lines.join("\n")}`, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=daedong-onboarding-history.csv" } });
}
