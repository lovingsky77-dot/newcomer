const base = "http://localhost:3000";
const password = process.env.TEST_ADMIN_PASSWORD;
if (!password) throw new Error("TEST_ADMIN_PASSWORD is required");

const loginResponse = await fetch(`${base}/api/admin/login`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email: process.env.TEST_ADMIN_EMAIL, password }),
});
if (!loginResponse.ok) throw new Error(`Login failed: ${await loginResponse.text()}`);
const cookie = loginResponse.headers.get("set-cookie")?.split(";")[0];
if (!cookie) throw new Error("Admin session cookie missing");

const quiz = await fetch(`${base}/api/quiz`).then((response) => response.json());
if (quiz.questions?.length !== 7) throw new Error("Quiz seed failed");

const submissionResponse = await fetch(`${base}/api/submissions`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    name: "테스트 사용자",
    organization: "대동",
    employeeNumber: "TEST-000",
    consent: true,
    score: 6,
    total: 6,
    valueType: "창조",
    values: ["창조"],
    strengths: ["실행력"],
    visionText: "자동 검증용 테스트 기록",
    answers: [{ questionId: "history", selectedIndex: 1, correct: true }],
  }),
});
if (!submissionResponse.ok) throw new Error(`Submission failed: ${await submissionResponse.text()}`);
const submission = await submissionResponse.json();

const dataResponse = await fetch(`${base}/api/admin/data`, { headers: { cookie } });
if (!dataResponse.ok) throw new Error(`Admin data failed: ${await dataResponse.text()}`);
const data = await dataResponse.json();
if (!data.submissions.some((item) => item.id === submission.id)) throw new Error("Saved submission not visible to admin");

const editableQuestion = data.questions.find((item) => item.id === "history");
const updateResponse = await fetch(`${base}/api/admin/data`, {
  method: "PUT",
  headers: { "content-type": "application/json", cookie },
  body: JSON.stringify(editableQuestion),
});
if (!updateResponse.ok) throw new Error(`Question update failed: ${await updateResponse.text()}`);

const exportResponse = await fetch(`${base}/api/admin/export`, { headers: { cookie } });
if (!exportResponse.ok || !(await exportResponse.text()).includes("완료일시")) throw new Error("Export failed");

for (const item of data.submissions.filter((entry) => entry.employeeNumber === "TEST-000")) {
  const deleteResponse = await fetch(`${base}/api/admin/data`, {
    method: "DELETE",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ id: item.id }),
  });
  if (!deleteResponse.ok) throw new Error(`Cleanup failed: ${await deleteResponse.text()}`);
}

console.log(JSON.stringify({ quiz: quiz.questions.length, submission: true, login: true, adminData: true, questionEdit: true, export: true, cleanup: true }));
