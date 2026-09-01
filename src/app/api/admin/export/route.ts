import { ensureDatabase, getD1 } from "../../../../db/d1";
import { isAdmin } from "../../../../lib/auth";

const csv = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export async function GET(request: Request) {
  if (!await isAdmin(request)) return Response.json({ error: "권한이 없습니다." }, { status: 401 });
  await ensureDatabase();
  const type = new URL(request.url).searchParams.get("type");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 13);
  if (type === "logistics") {
    const result = await getD1().prepare("SELECT * FROM logistics_responses ORDER BY submitted_at DESC").all();
    const header = ["제출일시", "이름", "소속", "숙박여부", "이동 방법", "교육종료일 복귀", "기타 전달사항"];
    const lines = result.results.map((row) => [row.submitted_at, row.name, row.organization, row.lodging_needed, row.outbound_method, row.return_method, row.note].map(csv).join(","));
    return new Response(`\uFEFF${header.map(csv).join(",")}\r\n${lines.join("\r\n")}`, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename=daedong-2026H2-travel-stay-${stamp}.csv` } });
  }
  const result = await getD1().prepare("SELECT * FROM submissions ORDER BY completed_at DESC").all();
  const header = ["완료일시", "이름", "소속", "사번", "교육차수", "점수", "총점", "핵심가치유형", "선택가치", "강점", "Vision Map"];
  const lines = result.results.map((row) => [row.completed_at, row.name, row.organization, row.employee_number, row.cohort, row.score, row.total, row.value_type, JSON.parse(String(row.values_json || "[]")).join(" / "), JSON.parse(String(row.strengths_json || "[]")).join(" / "), row.vision_text].map(csv).join(","));
  return new Response(`\uFEFF${header.map(csv).join(",")}\r\n${lines.join("\r\n")}`, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename=daedong-2026H2-quiz-history-${stamp}.csv` } });
}
