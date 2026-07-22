"use client";

import { useEffect, useMemo, useState } from "react";
import { deleteSubmissionFromSupabase, fetchAdminSubmissionsFromSupabase, isSupabaseConfigured, saveQuestionToSupabase } from "../../lib/supabase";
import type { QuizQuestion } from "../../lib/content";

type Submission = {
  id: string; name: string; organization: string; employeeNumber: string; cohort: string;
  score: number; total: number; valueType: string; values: string[]; strengths: string[];
  visionText: string; answers: Array<{ questionId: string; selectedIndex: number; correct: boolean | null }>; completedAt: string;
};
type Question = QuizQuestion;

export default function AdminPage() {
  const [status, setStatus] = useState<"checking" | "login" | "ready" | "config">("checking");
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [editing, setEditing] = useState<Question | null>(null);
  const [query, setQuery] = useState("");
  const [organization, setOrganization] = useState("전체");

  async function loadData() {
    try {
      const data = await fetchAdminSubmissionsFromSupabase();
      setSubmissions(data.submissions);
      setQuestions(data.questions);
      setStatus("ready");
      return;
    } catch {
      if (isSupabaseConfigured) {
        setStatus("ready");
        return;
      }
    }
    const config = await fetch("/api/admin/login").then((item) => item.json()).catch(() => ({ configured: false }));
    setStatus(config.configured ? "login" : "config");
  }

  useEffect(() => {
    loadData();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        setEditing(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filtered = useMemo(() => submissions.filter((item) => {
    const matchesOrg = organization === "전체" || item.organization === organization;
    const text = `${item.name} ${item.employeeNumber} ${item.organization}`.toLowerCase();
    return matchesOrg && text.includes(query.toLowerCase());
  }), [submissions, organization, query]);

  const metrics = useMemo(() => {
    const average = submissions.length ? submissions.reduce((sum, item) => sum + item.score / item.total * 100, 0) / submissions.length : 0;
    const people = new Set(submissions.map((item) => `${item.organization}:${item.employeeNumber}`)).size;
    const values = submissions.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item.valueType]: (acc[item.valueType] || 0) + 1 }), {});
    const topValue = Object.entries(values).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
    return { average, people, topValue };
  }, [submissions]);

  async function login(event: React.FormEvent) {
    event.preventDefault(); setError("");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(credentials) });
    if (!response.ok) { const data = await response.json(); setError(data.error || "로그인할 수 없습니다."); return; }
    setCredentials({ email: "", password: "" }); await loadData();
  }

  async function logout() { await fetch("/api/admin/logout").catch(() => undefined); setSubmissions([]); setStatus("login"); }

  async function removeSubmission(id: string) {
    if (!confirm("이 참여 기록을 삭제할까요? 삭제 후에는 복구할 수 없습니다.")) return;
    const ok = await deleteSubmissionFromSupabase(id);
    if (ok) { setSelected(null); await loadData(); }
  }

  async function saveQuestion(event: React.FormEvent) {
    event.preventDefault();
    if (!editing) return;
    const ok = await saveQuestionToSupabase(editing);
    if (ok) { setEditing(null); await loadData(); }
    else setError("문항을 저장하지 못했습니다.");
  }

  if (status === "checking") return <main className="admin-login"><div className="admin-login-card"><span className="loader" /><p>관리자 환경을 확인하고 있습니다.</p></div></main>;

  if (status === "config") return <main className="admin-login"><a className="admin-home" href="/">← 홈페이지</a><div className="admin-login-card"><img src="/images/daedong-logo.png" alt="DAEDONG" /><p className="eyebrow">ADMIN SETUP</p><h1>관리자 인증 설정이 필요합니다.</h1><p>공개 저장소에 비밀번호를 넣지 않기 위해 환경설정이 비어 있습니다. 배포 전 관리자 이메일, 암호화된 비밀번호와 세션 키를 안전한 환경변수로 등록하세요.</p><div className="config-note">설정값은 <strong>.env.local</strong>에만 보관되며 Git에는 포함되지 않습니다.</div></div></main>;

  if (status === "login") return <main className="admin-login"><a className="admin-home" href="/">← 홈페이지</a><form className="admin-login-card" onSubmit={login}><img src="/images/daedong-logo.png" alt="DAEDONG" /><p className="eyebrow">ADMIN ACCESS</p><h1>교육 운영 대시보드</h1><p>지정된 관리자 계정으로 로그인해주세요.</p><label>관리자 이메일<input type="email" value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} required /></label><label>비밀번호<input type="password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} required /></label>{error && <p className="form-error">{error}</p>}<button type="submit">관리자 로그인 →</button></form></main>;

  return <main className="admin-page">
    <aside className="admin-sidebar"><a href="/"><img src="/images/daedong-logo.png" alt="DAEDONG" /></a><div><p>ONBOARDING</p><strong>교육 운영센터</strong></div><nav><a className="active" href="#dashboard">▦ 대시보드</a><a href="#participants">◎ 참여 이력</a><a href="#questions">? 퀴즈 관리</a></nav><button onClick={logout}>로그아웃</button></aside>
    <div className="admin-main">
      <header><div><p>인사혁신팀(교육)</p><h1>Great Journey Dashboard</h1></div><a href="/api/admin/export">엑셀 다운로드 ↓</a></header>
      <section className="admin-metrics" id="dashboard"><article><span>누적 응시</span><strong>{submissions.length}</strong><small>전체 참여 이력</small></article><article><span>고유 참여자</span><strong>{metrics.people}</strong><small>소속 + 사번 기준</small></article><article><span>평균 정답률</span><strong>{metrics.average.toFixed(1)}%</strong><small>지식 문항 기준</small></article><article className="accent"><span>대표 핵심가치</span><strong>{metrics.topValue}</strong><small>가장 많은 결과 유형</small></article></section>
      <section className="admin-section" id="participants"><div className="admin-section-title"><div><p>PARTICIPATION HISTORY</p><h2>참여 이력</h2></div><span>{filtered.length}건</span></div><div className="table-tools"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름·사번 검색" /><select value={organization} onChange={(event) => setOrganization(event.target.value)}>{["전체", "대동", "대동Agtech", "대동기어", "대동모빌리티", "대동AILab", "기타"].map((item) => <option key={item}>{item}</option>)}</select></div><div className="admin-table-wrap"><table><thead><tr><th>완료일</th><th>이름</th><th>소속</th><th>사번</th><th>점수</th><th>핵심가치</th><th /></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td>{new Date(item.completedAt).toLocaleDateString("ko-KR")}</td><td><strong>{item.name}</strong></td><td>{item.organization}</td><td>{item.employeeNumber}</td><td>{item.score}/{item.total}</td><td><span className={`value-badge ${item.valueType}`}>{item.valueType}</span></td><td><button onClick={() => setSelected(item)}>상세 →</button></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="empty-state">아직 조건에 맞는 참여 이력이 없습니다.</div>}</div></section>
      <section className="admin-section" id="questions"><div className="admin-section-title"><div><p>QUIZ MANAGEMENT</p><h2>퀴즈 문항 관리</h2></div><span>{questions.length}문항</span></div><div className="question-admin-list">{questions.map((question, index) => <article key={question.id}><span>{String(index + 1).padStart(2, "0")}</span><div><small>{question.category} · {question.type === "personality" ? "성향" : "지식"}</small><h3>{question.question}</h3><p>{question.active ? "사용 중" : "비공개"}</p></div><button onClick={() => setEditing({ ...question, options: [...question.options] })}>편집</button></article>)}</div></section>
    </div>
    {selected && <div className="admin-drawer-backdrop" onClick={() => setSelected(null)}><aside className="admin-drawer" onClick={(event) => event.stopPropagation()}><button className="drawer-close" onClick={() => setSelected(null)}>×</button><p className="eyebrow">PARTICIPANT DETAIL</p><h2>{selected.name}</h2><div className="detail-meta"><span>{selected.organization}</span><span>{selected.employeeNumber}</span><span>{new Date(selected.completedAt).toLocaleString("ko-KR")}</span></div><div className="detail-score"><strong>{selected.score}/{selected.total}</strong><span>{selected.valueType}형 대동인</span></div><h3>Vision Map</h3><dl><dt>선택 가치</dt><dd>{selected.values.join(" · ") || "작성하지 않음"}</dd><dt>강점</dt><dd>{selected.strengths.join(" · ") || "작성하지 않음"}</dd><dt>목표</dt><dd>{selected.visionText || "작성하지 않음"}</dd></dl><h3>문항별 결과</h3><div className="answer-history">{selected.answers.map((answer, index) => <div key={`${answer.questionId}-${index}`}><span>Q{index + 1}</span><strong>{answer.correct === null ? "성향 문항" : answer.correct ? "정답" : "오답"}</strong></div>)}</div><button className="delete-record" onClick={() => removeSubmission(selected.id)}>이 기록 삭제</button></aside></div>}
    {editing && <div className="admin-drawer-backdrop" onClick={() => setEditing(null)}><form className="question-editor" onSubmit={saveQuestion} onClick={(event) => event.stopPropagation()}><button type="button" className="drawer-close" onClick={() => setEditing(null)}>×</button><p className="eyebrow">EDIT QUESTION</p><h2>퀴즈 문항 편집</h2><label>카테고리<input value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value })} /></label><label>질문<textarea value={editing.question} onChange={(event) => setEditing({ ...editing, question: event.target.value })} /></label><div className="option-editor">{editing.options.map((option, index) => <label key={index}><span>{String.fromCharCode(65 + index)}</span><input value={option} onChange={(event) => { const options = [...editing.options]; options[index] = event.target.value; setEditing({ ...editing, options }); }} />{editing.type !== "personality" && <input aria-label={`${index + 1}번 정답으로 지정`} type="radio" name="correct" checked={editing.correctIndex === index} onChange={() => setEditing({ ...editing, correctIndex: index })} />}</label>)}</div><label>해설<textarea value={editing.explanation} onChange={(event) => setEditing({ ...editing, explanation: event.target.value })} /></label><label className="toggle-row"><input type="checkbox" checked={editing.active} onChange={(event) => setEditing({ ...editing, active: event.target.checked })} /> 홈페이지에서 사용</label>{error && <p className="form-error">{error}</p>}<button className="save-question" type="submit">변경사항 저장</button></form></div>}
  </main>;
}
