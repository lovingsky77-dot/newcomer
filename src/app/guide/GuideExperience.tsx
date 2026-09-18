"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { uploadPhoto } from "../../lib/photo-upload";
import SurveyInvitation from "../SurveyInvitation";

const START_AT = new Date("2026-09-14T11:00:00+09:00").getTime();
const END_AT = new Date("2026-09-18T13:30:00+09:00").getTime();
const RESPONSE_DEADLINE = new Date("2026-09-13T23:59:59+09:00").getTime();

type Photo = { id: string; caption: string; fileName: string; uploadedAt: string; url: string };

function splitDuration(value: number) {
  const seconds = Math.max(0, Math.floor(value / 1000));
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  };
}

export function JourneyCountdown() {
  const [now, setNow] = useState(START_AT);
  useEffect(() => {
    const firstTick = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { window.clearTimeout(firstTick); window.clearInterval(timer); };
  }, []);

  const phase = now < START_AT ? "교육 시작까지" : now < END_AT ? "Great Journey 진행 중" : "Great Journey 완료";
  const duration = splitDuration(now < START_AT ? START_AT - now : now < END_AT ? END_AT - now : 0);

  return <section className="journey-clock" aria-label="교육 시작까지 남은 시간">
    <div>
      <p className="eyebrow light">COUNTDOWN TO GREAT JOURNEY</p>
      <h2>{phase}</h2>
      <p>{now < START_AT ? "9월 14일 오전 11시, 서울사무소에서 만납니다." : now < END_AT ? "오늘의 여정에 온전히 몰입해 보세요." : "함께 만든 5일의 기록을 돌아보세요."}</p>
    </div>
    {now < END_AT && <dl>
      <div><dt>DAY</dt><dd>{String(duration.days).padStart(2, "0")}</dd></div>
      <div><dt>HOUR</dt><dd>{String(duration.hours).padStart(2, "0")}</dd></div>
      <div><dt>MIN</dt><dd>{String(duration.minutes).padStart(2, "0")}</dd></div>
      <div><dt>SEC</dt><dd>{String(duration.seconds).padStart(2, "0")}</dd></div>
    </dl>}
  </section>;
}

export function LogisticsResponse() {
  const [closed, setClosed] = useState(false);
  const [form, setForm] = useState({ name: "", organization: "", lodgingNeeded: "", outboundMethod: "", returnMethod: "", note: "" });
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => setClosed(Date.now() > RESPONSE_DEADLINE), 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("saving"); setMessage("");
    const response = await fetch("/api/logistics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setStatus("error"); setMessage(data.error || "응답을 저장하지 못했습니다."); return; }
    setStatus("done"); setMessage("숙박·이동 응답이 저장되었습니다.");
  }

  return <section className="response-section" id="response">
    <div className="response-heading">
      <div><p className="eyebrow">TRAVEL & STAY RESPONSE</p><h2>숙박·이동 여부를<br />알려주세요.</h2></div>
    </div>
    {closed ? <div className="response-closed"><strong>응답이 마감되었습니다.</strong><p>변경이 필요한 경우 인사혁신팀(교육)으로 문의해 주세요.</p></div> : status === "done" ? <div className="response-complete"><span>✓</span><h3>{message}</h3><p>변경이 필요하면 같은 정보로 다시 제출해 주세요. 가장 최근 응답을 기준으로 확인합니다.</p><button onClick={() => { setStatus("idle"); setMessage(""); }}>응답 다시 작성</button></div> : <form className="response-form" onSubmit={submit}>
      <div className="form-row two">
        <label>이름<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
        <label>소속<input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} required /></label>
      </div>
      <fieldset><legend>숙박 여부</legend><div className="choice-row">{["숙박 필요", "숙박 불필요"].map((value) => <label key={value}><input type="radio" name="lodging" value={value} checked={form.lodgingNeeded === value} onChange={(e) => setForm({ ...form, lodgingNeeded: e.target.value })} required /><span>{value}</span></label>)}</div></fieldset>
      <fieldset><legend>이동 방법</legend><div className="choice-row travel-choices">{["셔틀버스 이동", "자차 이동"].map((value) => <label key={value}><input type="radio" name="outbound" value={value} checked={form.outboundMethod === value} onChange={(e) => setForm({ ...form, outboundMethod: e.target.value })} required /><span>{value}</span></label>)}</div></fieldset>
      <fieldset><legend>교육 종료일 복귀 방법</legend><div className="choice-row">{["열차 이용", "개별 이동"].map((value) => <label key={value}><input type="radio" name="return" value={value} checked={form.returnMethod === value} onChange={(e) => setForm({ ...form, returnMethod: e.target.value })} required /><span>{value}</span></label>)}</div><p className="field-note">9월 18일 오후 2시 30분 이후 출발 열차 예약을 권장합니다.</p></fieldset>
      <label className="note-field">기타 전달사항 <span>선택</span><textarea value={form.note} maxLength={500} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="이동이나 숙박과 관련해 담당자가 알아야 할 내용을 적어주세요." /></label>
      {status === "error" && <p className="form-error">{message}</p>}
      <button className="response-submit" type="submit" disabled={status === "saving"}>{status === "saving" ? "저장 중…" : "숙박·이동 응답 제출"}<span>→</span></button>
    </form>}
  </section>;
}

export function PhotoBoard() {
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadLock = useRef(false);
  const [progress, setProgress] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [active, setActive] = useState(0);

  async function loadPhotos() {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
    const response = await fetch("/api/photos", { cache: "no-store", signal: controller.signal });
    if (!response.ok) throw new Error("사진 목록을 불러오지 못했습니다.");
    const data = await response.json();
    setPhotos(data.photos || []);
    } finally { window.clearTimeout(timeout); }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadPhotos().catch(() => {
      setMessage("사진 목록을 불러오지 못했습니다. 새로고침해 주세요."); setStatus("error");
    }); }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (photos.length < 2) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % photos.length), 4500);
    return () => window.clearInterval(timer);
  }, [photos.length]);

  async function upload(event: React.FormEvent) {
    event.preventDefault();
    if (uploadLock.current) return;
    if (!files.length) { setStatus("error"); setMessage("업로드할 사진을 선택해 주세요."); return; }
    if (files.some((file) => file.size > 15 * 1024 * 1024)) {
      setStatus("error"); setMessage("사진은 파일당 15MB까지 업로드할 수 있습니다."); return;
    }
    uploadLock.current = true;
    setStatus("uploading"); setMessage("");
    let completed = 0;
    try {
      for (const file of files) {
        setProgress(`${completed + 1}/${files.length}장 · 0%`);
        await uploadPhoto(file, caption, (percent) => setProgress(`${completed + 1}/${files.length}장 · ${percent === 100 ? "저장 중" : `${percent}%`}`));
        completed += 1;
      }
      setStatus("done"); setMessage(`${completed}장의 사진이 업로드되었습니다.`);
      setFiles([]); setCaption(""); setActive(0);
      if (fileInput.current) fileInput.current.value = "";
    } catch (error) {
      setFiles(files.slice(completed));
      setStatus("error");
      setMessage(`${completed ? `${completed}장은 저장되었습니다. 남은 사진을 다시 업로드해 주세요. ` : ""}${error instanceof Error ? error.message : "사진 업로드에 실패했습니다. 다시 시도해 주세요."}`);
    } finally {
      uploadLock.current = false; setProgress("");
    }
    if (completed) await loadPhotos().catch(() => setMessage(`${completed}장은 저장되었습니다. 사진 목록은 새로고침 후 확인해 주세요.`));
  }

  const current = photos[active] || null;
  const selectedText = useMemo(() => files.length ? `${files.length}장 선택됨` : "사진 선택", [files.length]);

  return <section className="photo-section" id="photos">
    <div className="photo-heading"><div><p className="eyebrow light">OUR MOMENTS</p><h2>함께 만든 순간이<br />하나의 기록이 됩니다.</h2></div><p>교육 중 촬영한 사진을 올려주세요.<br />업로드된 사진은 자동 슬라이드로 함께 볼 수 있습니다.</p></div>
    <div className="photo-layout">
      <div className="photo-stage">
        {current ? <><img key={current.id} src={current.url} alt={current.caption || "Great Journey 교육 사진"} /><div><span>{String(active + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</span><p>{current.caption || "Great Journey, 우리의 순간"}</p></div></> : <div className="photo-empty"><strong>첫 번째 순간을 기다리고 있습니다.</strong><p>사진을 올리면 이곳에서 슬라이드가 시작됩니다.</p></div>}
        {photos.length > 1 && <div className="photo-controls"><button onClick={() => setActive((active - 1 + photos.length) % photos.length)} aria-label="이전 사진">←</button><button onClick={() => setActive((active + 1) % photos.length)} aria-label="다음 사진">→</button></div>}
      </div>
      <form className="photo-upload" onSubmit={upload}>
        <span className="upload-no">UPLOAD</span><h3>교육 사진 올리기</h3><p>JPG, PNG, WEBP, HEIC · 파일당 15MB<br />한 번에 최대 10장까지 선택할 수 있습니다.</p>
        <label className="file-picker"><input ref={fileInput} disabled={status === "uploading"} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" multiple onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 10))} /><span>{selectedText}</span><b>＋</b></label>
        <label className="caption-field">사진 설명 <span>선택</span><input value={caption} maxLength={120} onChange={(e) => setCaption(e.target.value)} placeholder="예: DAY 3, 대구공장에서" /></label>
        {status === "uploading" && <p role="status" aria-live="polite">{progress}</p>}
        {(status === "error" || status === "done") && <p role="status" className={status === "error" ? "form-error" : "upload-success"}>{message}</p>}
        <button type="submit" disabled={status === "uploading"}>{status === "uploading" ? "업로드 중…" : "사진 업로드"}<span>↗</span></button>
      </form>
    </div>
  </section>;
}

export function SurveyGate() {
  return <SurveyInvitation />;
}
