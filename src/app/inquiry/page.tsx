"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Message = { id: string; sender: "visitor" | "admin"; content: string; createdAt: string };
type Thread = { code: string; category: string; title: string; status: string; createdAt: string; updatedAt: string; messages: Message[] };
type SavedInquiry = { code: string; token: string; title: string };

const STORAGE_KEY = "daedong-private-inquiries";

export default function InquiryPage() {
  const [mode, setMode] = useState<"new" | "access" | "thread">("new");
  const [form, setForm] = useState({ category: "교육 일정", title: "", content: "" });
  const [credentials, setCredentials] = useState({ code: "", token: "" });
  const [thread, setThread] = useState<Thread | null>(null);
  const [saved, setSaved] = useState<SavedInquiry[]>([]);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [justCreated, setJustCreated] = useState(false);

  function saveInquiry(item: SavedInquiry) {
    const next = [item, ...saved.filter((entry) => entry.code !== item.code)].slice(0, 20);
    setSaved(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  async function loadThread(code = credentials.code, token = credentials.token, quiet = false) {
    if (!quiet) { setStatus("loading"); setMessage(""); }
    const response = await fetch("/api/inquiries/thread", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code, token }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { if (!quiet) { setStatus("error"); setMessage(data.error || "문의를 불러오지 못했습니다."); } return; }
    setCredentials({ code, token }); setThread(data.inquiry); setMode("thread"); setStatus("idle");
    window.location.hash = `${code}.${token}`;
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]") as SavedInquiry[];
      setSaved(Array.isArray(stored) ? stored : []);
      const value = window.location.hash.slice(1);
      const separator = value.indexOf(".");
      if (separator > 0) void loadThread(value.slice(0, separator), value.slice(separator + 1));
    }, 0);
    return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mode !== "thread" || !credentials.code || !credentials.token) return;
    const timer = window.setInterval(() => { void loadThread(credentials.code, credentials.token, true); }, 30000);
    return () => window.clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, credentials.code, credentials.token]);

  async function createInquiry(event: React.FormEvent) {
    event.preventDefault(); setStatus("loading"); setMessage("");
    const response = await fetch("/api/inquiries", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setStatus("error"); setMessage(data.error || "문의를 등록하지 못했습니다."); return; }
    const item = { code: data.code, token: data.token, title: form.title };
    saveInquiry(item); setCredentials({ code: data.code, token: data.token }); setJustCreated(true);
    await loadThread(data.code, data.token);
  }

  async function sendReply(event: React.FormEvent) {
    event.preventDefault();
    if (!reply.trim()) return;
    setStatus("loading"); setMessage("");
    const response = await fetch("/api/inquiries/thread", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...credentials, message: reply }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setStatus("error"); setMessage(data.error || "메시지를 보내지 못했습니다."); return; }
    setReply(""); setThread(data.inquiry); setStatus("idle");
  }

  const privateLink = useMemo(() => typeof window === "undefined" || !credentials.code ? "" : `${window.location.origin}/inquiry#${credentials.code}.${credentials.token}`, [credentials]);

  async function copyValue(value: string, success: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyMessage(success);
      window.setTimeout(() => setCopyMessage(""), 2500);
    } catch {
      setCopyMessage("복사하지 못했습니다. 직접 선택해 주세요.");
    }
  }

  return <main className="inquiry-page">
    <header className="inquiry-header">
      <Link className="brand" href="/" aria-label="Great Journey 홈"><img src="/images/daedong-logo.png" alt="DAEDONG" /></Link>
      <nav aria-label="주요 메뉴">
        <Link href="/#journey">5일의 여정</Link>
        <Link href="/#future">미래사업</Link>
        <Link href="/#vision">Vision Map</Link>
        <Link href="/guide">참여 전 준비</Link>
        <strong>문의게시판</strong>
      </nav>
      <div className="guide-header-actions">
        <Link className="prep-utility-link" href="/guide"><small>CHECK</small><strong>참여 전 준비</strong><span>↗</span></Link>
        <Link className="guide-home-link" href="/">홈 <span>↗</span></Link>
      </div>
    </header>

    <section className="inquiry-hero">
      <div><h1>문의게시판</h1><p>교육 관련 문의를 작성하고 답변을 확인할 수 있습니다.</p></div>
    </section>

    <nav className="inquiry-tabs" aria-label="문의 메뉴">
      <button className={mode === "new" ? "active" : ""} onClick={() => { setMode("new"); setJustCreated(false); window.history.replaceState(null, "", "/inquiry"); }}>문의 작성</button>
      <button className={mode !== "new" ? "active" : ""} onClick={() => setMode("access")}>문의 확인</button>
    </nav>

    {mode === "new" && <section className="inquiry-workspace">
      <div className="inquiry-intro"><h2>문의 작성</h2><p>문의 유형과 내용을 입력해 주세요. 문의 내용은 공개되지 않습니다.</p></div>
      <form className="inquiry-form" onSubmit={createInquiry}>
        <label>문의 유형<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{["교육 일정", "이동·숙박", "준비사항", "홈페이지 이용", "기타"].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>문의 제목<input value={form.title} maxLength={100} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="궁금한 내용을 짧게 적어주세요." required /></label>
        <label>문의 내용<textarea value={form.content} maxLength={3000} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="관리자에게 전달할 내용을 작성해 주세요." required /></label>
        {status === "error" && <p className="form-error">{message}</p>}
        <button type="submit" disabled={status === "loading"}>{status === "loading" ? "등록 중…" : "문의 등록"}<span>→</span></button>
      </form>
    </section>}

    {mode === "access" && <section className="inquiry-workspace access-workspace">
      <div className="inquiry-intro"><h2>문의 확인</h2><p>문의 등록 시 발급된 문의번호와 확인코드를 입력해 주세요. 같은 기기에 저장된 문의는 아래에서 바로 확인할 수 있습니다.</p></div>
      <div>
        <form className="access-form" onSubmit={(event) => { event.preventDefault(); void loadThread(); }}><label>문의번호<input value={credentials.code} onChange={(event) => setCredentials({ ...credentials, code: event.target.value.toUpperCase() })} placeholder="Q-123456" required /></label><label>확인코드<input value={credentials.token} onChange={(event) => setCredentials({ ...credentials, token: event.target.value })} placeholder="1234-5678" required /></label>{status === "error" && <p className="form-error">{message}</p>}<button disabled={status === "loading"}>{status === "loading" ? "확인 중…" : "문의 확인"}</button></form>
        {saved.length > 0 && <div className="saved-inquiries"><h3>이 기기에 저장된 문의</h3>{saved.map((item) => <button key={item.code} onClick={() => void loadThread(item.code, item.token)}><span>{item.code}</span><strong>{item.title}</strong><b>열기 →</b></button>)}</div>}
      </div>
    </section>}

    {mode === "thread" && thread && <section className="thread-section">
      {justCreated && <div className="recovery-card"><div><h2>문의가 등록되었습니다.</h2><p>이 기기에 자동 저장되었습니다. 다른 기기에서 확인하려면 아래 정보를 보관해 주세요.</p></div><dl><div><dt>문의번호</dt><dd>{credentials.code}</dd><button onClick={() => void copyValue(credentials.code, "문의번호를 복사했습니다.")}>복사</button></div><div><dt>확인코드</dt><dd>{credentials.token}</dd><button onClick={() => void copyValue(credentials.token, "확인코드를 복사했습니다.")}>복사</button></div></dl><button onClick={() => void copyValue(`문의번호: ${credentials.code}\n확인코드: ${credentials.token}\n문의 링크: ${privateLink}`, "문의 확인 정보를 복사했습니다.")}>문의 확인 정보 복사</button>{copyMessage && <span role="status">{copyMessage}</span>}</div>}
      <div className="thread-head"><div><p>{thread.category} · {thread.code}</p><h2>{thread.title}</h2></div><span className={`thread-status ${thread.status}`}>{thread.status === "answered" ? "답변 완료" : thread.status === "closed" ? "종료" : "답변 대기"}</span></div>
      <div className="conversation">{thread.messages.map((item) => <article className={item.sender} key={item.id}><div><span>{item.sender === "admin" ? "인사혁신팀(교육)" : "작성자"}</span><time>{new Date(item.createdAt).toLocaleString("ko-KR")}</time></div><p>{item.content}</p></article>)}</div>
      {thread.status !== "closed" && <form className="thread-reply" onSubmit={sendReply}><label>추가 메시지<textarea value={reply} maxLength={3000} onChange={(event) => setReply(event.target.value)} placeholder="관리자에게 추가로 전달할 내용을 작성해 주세요." required /></label>{status === "error" && <p className="form-error">{message}</p>}<button disabled={status === "loading"}>{status === "loading" ? "전송 중…" : "메시지 보내기"}<span>→</span></button></form>}
      <div className="thread-tools"><button onClick={() => void loadThread(credentials.code, credentials.token)}>새 답변 확인 ↻</button><button onClick={() => void copyValue(privateLink, "문의 링크를 복사했습니다.")}>문의 링크 복사</button>{copyMessage && <span role="status">{copyMessage}</span>}</div>
    </section>}

    <footer className="inquiry-footer"><img src="/images/daedong-logo.png" alt="DAEDONG" /><p>문의 내용은 공개되지 않으며 관리자와 작성자만 확인할 수 있습니다.</p><Link href="/guide">교육 준비 안내로 돌아가기 →</Link></footer>
  </main>;
}
