"use client";

/* eslint-disable @next/next/no-html-link-for-pages */

import { useEffect, useMemo, useState } from "react";
import type { QuizQuestion } from "../../lib/content";

type Submission = {
  id: string; name: string; organization: string; employeeNumber: string; cohort: string;
  score: number; total: number; valueType: string; values: string[]; strengths: string[];
  visionText: string; answers: Array<{ questionId: string; selectedIndex: number; correct: boolean | null }>; completedAt: string;
};
type Question = QuizQuestion;
type Logistics = {
  id: string; name: string; organization: string; lodgingNeeded: string;
  outboundMethod: string; returnMethod: string; note: string; submittedAt: string;
};
type InquiryMessage = { id: string; sender: "visitor" | "admin"; content: string; createdAt: string };
type Inquiry = { id: string; code: string; category: string; title: string; status: string; createdAt: string; updatedAt: string; messages: InquiryMessage[] };

export default function AdminPage() {
  const [status, setStatus] = useState<"checking" | "login" | "ready" | "config">("checking");
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [logistics, setLogistics] = useState<Logistics[]>([]);
  const [photoCount, setPhotoCount] = useState(0);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [adminReply, setAdminReply] = useState("");
  const [editing, setEditing] = useState<Question | null>(null);
  const [query, setQuery] = useState("");
  const [organization, setOrganization] = useState("전체");

  async function loadData() {
    const response = await fetch("/api/admin/data");
    if (response.ok) {
      const data = await response.json();
      setSubmissions(data.submissions);
      setQuestions(data.questions);
      setLogistics(data.logistics || []);
      setPhotoCount(data.photos?.length || 0);
      setInquiries(data.inquiries || []);
      setStatus("ready");
      return;
    }
    const config = await fetch("/api/admin/login").then((item) => item.json()).catch(() => ({ configured: false }));
    setStatus(config.configured ? "login" : "config");
  }

  useEffect(() => {
    const loadTimer = window.setTimeout(() => { void loadData(); }, 0);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        setSelectedInquiry(null);
        setEditing(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(loadTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const filtered = useMemo(() => submissions.filter((item) => {
    const matchesOrg = organization === "전체" || item.organization === organization;
    const text = `${item.name} ${item.employeeNumber} ${item.organization}`.toLowerCase();
    return matchesOrg && text.includes(query.toLowerCase());
  }), [submissions, organization, query]);

  async function login(event: React.FormEvent) {
    event.preventDefault(); setError("");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(credentials) });
    if (!response.ok) { const data = await response.json(); setError(data.error || "로그인할 수 없습니다."); return; }
    setCredentials({ email: "", password: "" }); await loadData();
  }

  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); setSubmissions([]); setStatus("login"); }

  async function removeSubmission(id: string) {
    if (!confirm("이 참여 기록을 삭제할까요? 삭제 후에는 복구할 수 없습니다.")) return;
    const response = await fetch("/api/admin/data", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
    if (response.ok) { setSelected(null); await loadData(); }
  }

  async function saveQuestion(event: React.FormEvent) {
    event.preventDefault();
    if (!editing) return;
    const response = await fetch("/api/admin/data", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(editing) });
    if (response.ok) { setEditing(null); await loadData(); }
    else setError("문항을 저장하지 못했습니다.");
  }

  async function replyToInquiry(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedInquiry || !adminReply.trim()) return;
    const response = await fetch("/api/admin/inquiries", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ inquiryId: selectedInquiry.id, message: adminReply }) });
    if (!response.ok) { setError("답변을 저장하지 못했습니다."); return; }
    setAdminReply(""); setSelectedInquiry(null); await loadData();
  }

  async function changeInquiryStatus(status: "open" | "closed") {
    if (!selectedInquiry) return;
    const response = await fetch("/api/admin/inquiries", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ inquiryId: selectedInquiry.id, status }) });
    if (response.ok) { setSelectedInquiry(null); await loadData(); }
  }

  async function removeInquiry() {
    if (!selectedInquiry || !confirm("이 문의와 대화 내용을 삭제할까요? 삭제 후에는 복구할 수 없습니다.")) return;
    const response = await fetch("/api/admin/inquiries", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ inquiryId: selectedInquiry.id }) });
    if (response.ok) { setSelectedInquiry(null); await loadData(); }
  }

  if (status === "checking") return <main className="admin-login"><div className="admin-login-card"><span className="loader" /><p>관리자 환경을 확인하고 있습니다.</p></div></main>;

  if (status === "config") return <main className="admin-login"><a className="admin-home" href="/">← 홈페이지</a><div className="admin-login-card"><img src="/images/daedong-logo.png" alt="DAEDONG" /><p className="eyebrow">ADMIN SETUP</p><h1>관리자 인증 설정이 필요합니다.</h1><p>공개 저장소에 비밀번호를 넣지 않기 위해 환경설정이 비어 있습니다. 배포 전 관리자 이메일, 암호화된 비밀번호와 세션 키를 안전한 환경변수로 등록하세요.</p><div className="config-note">설정값은 <strong>.env.local</strong>에만 보관되며 Git에는 포함되지 않습니다.</div></div></main>;

  if (status === "login") return <main className="admin-login"><a className="admin-home" href="/">← 홈페이지</a><form className="admin-login-card" onSubmit={login}><img src="/images/daedong-logo.png" alt="DAEDONG" /><p className="eyebrow">ADMIN ACCESS</p><h1>교육 운영 대시보드</h1><p>지정된 관리자 계정으로 로그인해주세요.</p><label>관리자 이메일<input type="email" value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} required /></label><label>비밀번호<input type="password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} required /></label>{error && <p className="form-error">{error}</p>}<button type="submit">관리자 로그인 →</button></form></main>;

  return <main className="admin-page">
    <aside className="admin-sidebar"><a href="/"><img src="/images/daedong-logo.png" alt="DAEDONG" /></a><div><p>ONBOARDING</p><strong>교육 운영센터</strong></div><nav><a className="active" href="#dashboard">▦ 대시보드</a><a href="#inquiries">◇ 문의함</a><a href="#logistics">↗ 숙박·이동 응답</a><a href="#participants">◎ 참여 이력</a><a href="#questions">? 퀴즈 관리</a></nav><button onClick={logout}>로그아웃</button></aside>
    <div className="admin-main">
      <header><div><p>인사혁신팀(교육)</p><h1>Great Journey Dashboard</h1></div><a href="/api/admin/export">퀴즈 이력 다운로드 ↓</a></header>
      <section className="admin-metrics" id="dashboard"><article><span>답변 대기 문의</span><strong>{inquiries.filter((item) => item.status === "open").length}</strong><small>익명 1:1 문의</small></article><article><span>숙박·이동 응답</span><strong>{logistics.length}</strong><small>9.13 23:59 마감</small></article><article><span>교육 사진</span><strong>{photoCount}</strong><small>슬라이드 기록</small></article><article className="accent"><span>누적 응시</span><strong>{submissions.length}</strong><small>전체 참여 이력</small></article></section>
      <section className="admin-section" id="inquiries"><div className="admin-section-title"><div><p>INQUIRY</p><h2>문의함</h2></div><span>{inquiries.length}건</span></div><div className="admin-table-wrap"><table><thead><tr><th>최근 업데이트</th><th>문의 번호</th><th>유형</th><th>제목</th><th>상태</th><th /></tr></thead><tbody>{inquiries.map((item) => <tr key={item.id}><td>{new Date(item.updatedAt).toLocaleString("ko-KR")}</td><td><strong>{item.code}</strong></td><td>{item.category}</td><td>{item.title}</td><td><span className={`inquiry-admin-status ${item.status}`}>{item.status === "answered" ? "답변 완료" : item.status === "closed" ? "종료" : "답변 대기"}</span></td><td><button onClick={() => { setSelectedInquiry(item); setAdminReply(""); }}>대화 보기 →</button></td></tr>)}</tbody></table>{inquiries.length === 0 && <div className="empty-state">아직 접수된 문의가 없습니다.</div>}</div></section>
      <section className="admin-section" id="logistics"><div className="admin-section-title"><div><p>TRAVEL & STAY</p><h2>숙박·이동 응답</h2></div><a className="admin-export-link" href="/api/admin/export?type=logistics">응답 다운로드 ↓</a></div><div className="admin-table-wrap"><table><thead><tr><th>제출일</th><th>이름</th><th>소속</th><th>숙박</th><th>이동 방법</th><th>복귀</th><th>전달사항</th></tr></thead><tbody>{logistics.map((item) => <tr key={item.id}><td>{new Date(item.submittedAt).toLocaleString("ko-KR")}</td><td><strong>{item.name}</strong></td><td>{item.organization}</td><td>{item.lodgingNeeded}</td><td>{item.outboundMethod}</td><td>{item.returnMethod}</td><td>{item.note || "-"}</td></tr>)}</tbody></table>{logistics.length === 0 && <div className="empty-state">아직 제출된 숙박·이동 응답이 없습니다.</div>}</div></section>
      <section className="admin-section" id="participants"><div className="admin-section-title"><div><p>PARTICIPATION HISTORY</p><h2>참여 이력</h2></div><span>{filtered.length}건</span></div><div className="table-tools"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름·사번 검색" /><select value={organization} onChange={(event) => setOrganization(event.target.value)}>{["전체", "대동", "대동Agtech", "대동기어", "대동모빌리티", "대동AILab", "기타"].map((item) => <option key={item}>{item}</option>)}</select></div><div className="admin-table-wrap"><table><thead><tr><th>완료일</th><th>이름</th><th>소속</th><th>사번</th><th>점수</th><th>핵심가치</th><th /></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td>{new Date(item.completedAt).toLocaleDateString("ko-KR")}</td><td><strong>{item.name}</strong></td><td>{item.organization}</td><td>{item.employeeNumber}</td><td>{item.score}/{item.total}</td><td><span className={`value-badge ${item.valueType}`}>{item.valueType}</span></td><td><button onClick={() => setSelected(item)}>상세 →</button></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="empty-state">아직 조건에 맞는 참여 이력이 없습니다.</div>}</div></section>
      <section className="admin-section" id="questions"><div className="admin-section-title"><div><p>QUIZ MANAGEMENT</p><h2>퀴즈 문항 관리</h2></div><span>{questions.length}문항</span></div><div className="question-admin-list">{questions.map((question, index) => <article key={question.id}><span>{String(index + 1).padStart(2, "0")}</span><div><small>{question.category} · {question.type === "personality" ? "성향" : "지식"}</small><h3>{question.question}</h3><p>{question.active ? "사용 중" : "비공개"}</p></div><button onClick={() => setEditing({ ...question, options: [...question.options] })}>편집</button></article>)}</div></section>
    </div>
    {selected && <div className="admin-drawer-backdrop" onClick={() => setSelected(null)}><aside className="admin-drawer" onClick={(event) => event.stopPropagation()}><button className="drawer-close" onClick={() => setSelected(null)}>×</button><p className="eyebrow">PARTICIPANT DETAIL</p><h2>{selected.name}</h2><div className="detail-meta"><span>{selected.organization}</span><span>{selected.employeeNumber}</span><span>{new Date(selected.completedAt).toLocaleString("ko-KR")}</span></div><div className="detail-score"><strong>{selected.score}/{selected.total}</strong><span>{selected.valueType}형 대동인</span></div><h3>Vision Map</h3><dl><dt>선택 가치</dt><dd>{selected.values.join(" · ") || "작성하지 않음"}</dd><dt>강점</dt><dd>{selected.strengths.join(" · ") || "작성하지 않음"}</dd><dt>목표</dt><dd>{selected.visionText || "작성하지 않음"}</dd></dl><h3>문항별 결과</h3><div className="answer-history">{selected.answers.map((answer, index) => <div key={`${answer.questionId}-${index}`}><span>Q{index + 1}</span><strong>{answer.correct === null ? "성향 문항" : answer.correct ? "정답" : "오답"}</strong></div>)}</div><button className="delete-record" onClick={() => removeSubmission(selected.id)}>이 기록 삭제</button></aside></div>}
    {selectedInquiry && <div className="admin-drawer-backdrop" onClick={() => setSelectedInquiry(null)}><aside className="admin-drawer inquiry-admin-drawer" onClick={(event) => event.stopPropagation()}><button className="drawer-close" onClick={() => setSelectedInquiry(null)}>×</button><p className="eyebrow">PRIVATE INQUIRY · {selectedInquiry.code}</p><h2>{selectedInquiry.title}</h2><div className="detail-meta"><span>{selectedInquiry.category}</span><span>{selectedInquiry.status === "answered" ? "답변 완료" : selectedInquiry.status === "closed" ? "종료" : "답변 대기"}</span></div><div className="admin-conversation">{selectedInquiry.messages.map((item) => <article className={item.sender} key={item.id}><div><strong>{item.sender === "admin" ? "관리자" : "익명 작성자"}</strong><time>{new Date(item.createdAt).toLocaleString("ko-KR")}</time></div><p>{item.content}</p></article>)}</div>{selectedInquiry.status !== "closed" && <form className="admin-inquiry-reply" onSubmit={replyToInquiry}><label>관리자 답변<textarea value={adminReply} maxLength={3000} onChange={(event) => setAdminReply(event.target.value)} required /></label><button type="submit">답변 저장 및 전송</button></form>}<div className="admin-inquiry-actions">{selectedInquiry.status === "closed" ? <button onClick={() => void changeInquiryStatus("open")}>문의 다시 열기</button> : <button onClick={() => void changeInquiryStatus("closed")}>문의 종료</button>}<button className="delete-inquiry" onClick={() => void removeInquiry()}>문의 삭제</button></div></aside></div>}
    {editing && <div className="admin-drawer-backdrop" onClick={() => setEditing(null)}><form className="question-editor" onSubmit={saveQuestion} onClick={(event) => event.stopPropagation()}><button type="button" className="drawer-close" onClick={() => setEditing(null)}>×</button><p className="eyebrow">EDIT QUESTION</p><h2>퀴즈 문항 편집</h2><label>카테고리<input value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value })} /></label><label>질문<textarea value={editing.question} onChange={(event) => setEditing({ ...editing, question: event.target.value })} /></label><div className="option-editor">{editing.options.map((option, index) => <label key={index}><span>{String.fromCharCode(65 + index)}</span><input value={option} onChange={(event) => { const options = [...editing.options]; options[index] = event.target.value; setEditing({ ...editing, options }); }} />{editing.type !== "personality" && <input aria-label={`${index + 1}번 정답으로 지정`} type="radio" name="correct" checked={editing.correctIndex === index} onChange={() => setEditing({ ...editing, correctIndex: index })} />}</label>)}</div><label>해설<textarea value={editing.explanation} onChange={(event) => setEditing({ ...editing, explanation: event.target.value })} /></label><label className="toggle-row"><input type="checkbox" checked={editing.active} onChange={(event) => setEditing({ ...editing, active: event.target.checked })} /> 홈페이지에서 사용</label>{error && <p className="form-error">{error}</p>}<button className="save-question" type="submit">변경사항 저장</button></form></div>}
  </main>;
}
