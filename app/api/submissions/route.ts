import { ensureDatabase, getD1 } from "../../../db/d1";

const organizations = ["대동", "대동Agtech", "대동기어", "대동모빌리티", "대동AILab", "기타"];

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Record<string, unknown>;
    const name = String(payload.name || "").trim();
    const organization = String(payload.organization || "").trim();
    const employeeNumber = String(payload.employeeNumber || "").trim();
    const visionText = String(payload.visionText || "").trim().slice(0, 300);
    const answers = Array.isArray(payload.answers) ? payload.answers : [];
    const values = Array.isArray(payload.values) ? payload.values : [];
    const strengths = Array.isArray(payload.strengths) ? payload.strengths : [];
    if (!name || name.length > 40 || !employeeNumber || employeeNumber.length > 30 || !organizations.includes(organization)) {
      return Response.json({ error: "참여자 정보를 확인해주세요." }, { status: 400 });
    }
    if (!payload.consent) return Response.json({ error: "개인정보 수집·이용 동의가 필요합니다." }, { status: 400 });
    const score = Number(payload.score || 0);
    const total = Number(payload.total || 0);
    const valueType = String(payload.valueType || "창조");
    const id = crypto.randomUUID();
    const completedAt = new Date().toISOString();
    await ensureDatabase();
    await getD1().prepare(`INSERT INTO submissions
      (id, name, organization, employee_number, cohort, score, total, value_type, values_json, strengths_json, vision_text, answers_json, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, name, organization, employeeNumber, "2026 상반기", score, total, valueType, JSON.stringify(values), JSON.stringify(strengths), visionText, JSON.stringify(answers), completedAt).run();
    return Response.json({ id, completedAt }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "결과를 저장하지 못했습니다." }, { status: 500 });
  }
}
