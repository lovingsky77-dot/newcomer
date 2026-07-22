"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { defaultQuestions, schedules, type QuizQuestion, valueTypes } from "../lib/content";

const values = [
  { name: "창조", en: "CREATIVITY", copy: "익숙한 방식 너머의 가능성을 발견합니다." },
  { name: "신뢰", en: "TRUST", copy: "약속과 연결의 힘으로 함께 나아갑니다." },
  { name: "열정", en: "PASSION", copy: "현장의 변화를 끝까지 만들어냅니다." },
  { name: "책임", en: "RESPONSIBILITY", copy: "우리의 선택이 만드는 결과를 완성합니다." },
];

const futureBusinesses = [
  { no: "01", title: "정밀농업", en: "PRECISION FARMING", image: "/images/future-03.png", copy: "데이터로 필요한 만큼 투입하고 더 많이 수확합니다." },
  { no: "02", title: "로보틱스", en: "ROBOTICS", image: "/images/future-overview.png", copy: "이동부터 작업까지 책임지는 필드로봇을 만듭니다." },
  { no: "03", title: "스마트파밍", en: "SMART FARMING", image: "/images/ai-field-hero.png", copy: "AI가 판단하고 제어하는 자율 농장의 미래를 엽니다." },
  { no: "04", title: "AI 에이전트", en: "AI AGENT", image: "/images/future-02.png", copy: "복잡한 농업 현장의 의사결정을 더 쉽고 정확하게 만듭니다." },
  { no: "05", title: "커넥티드", en: "CONNECTED", image: "/images/future-05.png", copy: "농기계와 고객, 서비스를 하나의 데이터 흐름으로 연결합니다." },
];

const strengths = ["관찰력", "실행력", "문제해결", "소통", "분석력", "도전정신", "협업", "책임감"];

type PublicStats = { published: boolean; count: number; remaining?: number; values?: Array<{ valueType: string; count: number }> };

export default function Home() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [activeDay, setActiveDay] = useState("DAY 1");
  const [videoOpen, setVideoOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(defaultQuestions);
  const [quizStep, setQuizStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);
  const [visionText, setVisionText] = useState("");
  const [participant, setParticipant] = useState({ name: "", organization: "대동", employeeNumber: "", consent: false });
  const [result, setResult] = useState<{ score: number; total: number; valueType: string } | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [stats, setStats] = useState<PublicStats>({ published: false, count: 0, remaining: 10 });

  useEffect(() => {
    fetch("/api/quiz").then((response) => response.ok ? response.json() : null).then((data) => data?.questions?.length && setQuizQuestions(data.questions)).catch(() => undefined);
    fetch("/api/stats").then((response) => response.ok ? response.json() : null).then((data) => data && setStats(data)).catch(() => undefined);
  }, []);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cursor = cursorRef.current;
    if (!cursor || !finePointer.matches || reducedMotion.matches) return;

    document.documentElement.classList.add("custom-cursor-enabled");
    const moveCursor = (event: PointerEvent) => {
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      cursor.classList.add("is-visible");
      const target = event.target as Element | null;
      cursor.classList.toggle("is-active", Boolean(target?.closest("a, button, input, select, textarea, [role='tab']")));
    };
    const hideCursor = () => cursor.classList.remove("is-visible");
    const pressCursor = () => cursor.classList.add("is-pressed");
    const releaseCursor = () => cursor.classList.remove("is-pressed");

    window.addEventListener("pointermove", moveCursor, { passive: true });
    window.addEventListener("pointerdown", pressCursor, { passive: true });
    window.addEventListener("pointerup", releaseCursor, { passive: true });
    document.documentElement.addEventListener("mouseleave", hideCursor);
    return () => {
      document.documentElement.classList.remove("custom-cursor-enabled");
      window.removeEventListener("pointermove", moveCursor);
      window.removeEventListener("pointerdown", pressCursor);
      window.removeEventListener("pointerup", releaseCursor);
      document.documentElement.removeEventListener("mouseleave", hideCursor);
    };
  }, []);

  const currentQuestion = quizStep >= 0 ? quizQuestions[quizStep] : null;
  const journey = schedules[activeDay];
  const progress = quizStep < 0 ? 0 : ((quizStep + 1) / quizQuestions.length) * 100;

  const valueDescription = useMemo(() => ({
    창조: "새로운 가능성을 먼저 발견하는 미래 설계자",
    신뢰: "사람과 아이디어를 연결하는 든든한 파트너",
    열정: "변화의 끝까지 에너지를 이어가는 실행가",
    책임: "맡은 결과를 단단하게 완성하는 현장 리더",
  }), []);

  function toggleChoice(list: string[], setter: (next: string[]) => void, value: string) {
    if (list.includes(value)) setter(list.filter((item) => item !== value));
    else if (list.length < 3) setter([...list, value]);
  }

  function openQuiz() {
    setQuizStep(-1);
    setAnswers({});
    setResult(null);
    setSubmitState("idle");
    setQuizOpen(true);
  }

  async function finishQuiz() {
    const knowledge = quizQuestions.filter((question) => question.type === "knowledge");
    const score = knowledge.filter((question) => answers[question.id] === question.correctIndex).length;
    const personality = quizQuestions.find((question) => question.type === "personality");
    const valueType = valueTypes[answers[personality?.id || ""] ?? 0];
    const summary = { score, total: knowledge.length, valueType };
    setResult(summary);
    setSubmitState("saving");
    const answerRows = quizQuestions.map((question) => ({ questionId: question.id, selectedIndex: answers[question.id], correct: question.type === "personality" ? null : answers[question.id] === question.correctIndex }));
    try {
      const response = await fetch("/api/submissions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...participant, ...summary, values: selectedValues, strengths: selectedStrengths, visionText, answers: answerRows }) });
      if (!response.ok) throw new Error();
      setSubmitState("saved");
      const nextStats = await fetch("/api/stats").then((item) => item.json());
      setStats(nextStats);
    } catch {
      setSubmitState("error");
    }
  }

  function nextQuestion() {
    if (quizStep === quizQuestions.length - 1) finishQuiz();
    else setQuizStep((step) => step + 1);
  }

  return (
    <main>
      <div className="daedong-cursor" ref={cursorRef} aria-hidden="true"><span /></div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="대동 온보딩 홈"><img src="/images/daedong-logo.png" alt="DAEDONG" /></a>
        <nav aria-label="주요 메뉴">
          <a href="#journey">5일의 여정</a><a href="#future">미래사업</a><a href="#vision">Vision Map</a>
        </nav>
        <button className="header-cta" onClick={openQuiz}>대동인 챌린지 <span>↗</span></button>
      </header>

      <section className="hero" id="top">
        <img className="hero-image" src="/images/ai-field-hero.png" alt="미래 농업 현장과 스마트 온실" />
        <div className="hero-shade" />
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow light">AI TO THE FIELD · GREAT JOURNEY</p>
          <h1>대동에서 시작하는<br /><em>Great Journey</em></h1>
          <p className="hero-copy">농업의 미래를 이해하고,<br className="mobile-only" /> 나의 미래를 설계하는 5일</p>
          <div className="hero-actions">
            <a className="primary-button" href="#journey">여정 시작하기 <span>↓</span></a>
            <button className="text-button" onClick={() => setVideoOpen(true)}><span className="play">▶</span> 30초로 만나는 대동의 미래</button>
          </div>
        </div>
        <div className="hero-meta">
          <span>4박 5일</span><span>3 JOURNEY THEMES</span><span>인사혁신팀(교육)</span>
        </div>
        <div className="scroll-mark"><span /> SCROLL TO EXPLORE</div>
      </section>

      <section className="purpose section-pad">
        <div className="section-heading">
          <p className="eyebrow">WHY THIS JOURNEY</p>
          <h2>대동을 이해하는 순간,<br />나의 역할이 선명해집니다.</h2>
        </div>
        <div className="purpose-grid">
          {[
            ["01", "KNOW", "대동의 사업과 미래 비전을 이해합니다."],
            ["02", "CONNECT", "동료와 그룹사, 현장의 흐름을 연결합니다."],
            ["03", "GROW", "대동에서 만들어갈 나만의 비전을 설계합니다."],
          ].map(([no, title, copy]) => <article className="purpose-card" key={title}><span>{no}</span><h3>{title}</h3><p>{copy}</p><i /></article>)}
        </div>
      </section>

      <section className="theme-section section-pad">
        <div className="section-heading inverse"><p className="eyebrow light">3 JOURNEY THEMES</p><h2>5일 동안 우리는<br />세 번의 전환을 만납니다.</h2></div>
        <div className="theme-stack">
          <article><span>THEME 01</span><div><small>MEET</small><h3>회사와 나의<br />비전 찾기</h3></div><p>환영과 연결 속에서<br />대동인으로서의 첫 질문을 시작합니다.</p></article>
          <article><span>THEME 02</span><div><small>DISCOVER</small><h3>대동의 미래와<br />사업 이해</h3></div><p>AI와 로보틱스가 만드는<br />미래농업의 성장 방향을 발견합니다.</p></article>
          <article><span>THEME 03</span><div><small>EXPERIENCE</small><h3>체험으로 완성하는<br />대동인화</h3></div><p>연구개발부터 생산과 체험까지<br />현장의 흐름을 몸으로 이해합니다.</p></article>
        </div>
      </section>

      <section className="journey section-pad" id="journey">
        <div className="section-heading row-heading"><div><p className="eyebrow">5 DAYS, ONE JOURNEY</p><h2>매일 다른 현장에서<br />하나의 대동을 만납니다.</h2></div><p className="heading-note">2026 상반기 운영 일정<br /><span>세부 일정은 운영 상황에 따라 달라질 수 있습니다.</span></p></div>
        <div className="day-tabs" role="tablist" aria-label="교육 일차 선택">
          {Object.keys(schedules).map((day) => <button role="tab" aria-selected={activeDay === day} className={activeDay === day ? "active" : ""} key={day} onClick={() => setActiveDay(day)}><strong>{day}</strong><span>{schedules[day].theme}</span></button>)}
        </div>
        <div className="schedule-panel">
          <div className="schedule-intro"><p>{activeDay}</p><h3>{journey.theme}</h3><span>PLACE</span><strong>{journey.place}</strong></div>
          <div className="schedule-list">
            {journey.items.map((item) => <article key={`${item.time}-${item.title}`}><time>{item.time}</time><div><span className={`type ${item.type}`}>{({ welcome: "WELCOME", business: "BUSINESS", move: "MOVE", experience: "EXPERIENCE", vision: "VISIONING" })[item.type]}</span><h4>{item.title}</h4>{item.detail && <p>{item.detail}</p>}</div></article>)}
          </div>
        </div>
        <div className="route-line"><span>서울사무소</span><i /><span>동부권역센터</span><i /><span>창녕 비전캠퍼스</span><i /><span>성서통합R&D센터</span><i /><span>각 사업장</span><i /><span>그룹시험센터</span></div>
      </section>

      <section className="future" id="future">
        <div className="future-cover"><img src="/images/future-02.png" alt="AI로 연결된 대동 농기계" /><div><p className="eyebrow light">AI TO THE FIELD</p><h2>농업 현장으로<br />확장되는 AI</h2><p>정밀농업, 로보틱스, 스마트파밍, AI 에이전트, 커넥티드.<br />다섯 개의 사업이 하나의 미래농업 생태계로 연결됩니다.</p></div></div>
        <div className="future-grid">
          {futureBusinesses.map((item) => <article key={item.no}><img src={item.image} alt="" /><div className="future-card-copy"><span>{item.no}</span><small>{item.en}</small><h3>{item.title}</h3><p>{item.copy}</p></div></article>)}
        </div>
      </section>

      <section className="values section-pad">
        <div className="section-heading"><p className="eyebrow">THE WAY WE WORK</p><h2>대동의 미래를 움직이는<br />네 가지 가치</h2></div>
        <div className="value-grid">{values.map((item, index) => <article key={item.name}><span>0{index + 1}</span><small>{item.en}</small><h3>{item.name}</h3><p>{item.copy}</p></article>)}</div>
      </section>

      <section className="vision section-pad" id="vision">
        <div className="vision-copy"><p className="eyebrow light">MY VISION MAP</p><h2>이제, 대동에서의<br />나를 그려볼 차례입니다.</h2><p>가치와 강점, 목표를 한 장의 방향으로 연결해보세요.<br />작성한 내용은 퀴즈 완료 시 참여 이력과 함께 저장됩니다.</p></div>
        <div className="vision-builder">
          <div className="builder-step"><div className="step-title"><span>STEP 01</span><h3>나에게 중요한 가치를 선택하세요.</h3><small>최대 3개</small></div><div className="chip-grid">{values.map((item) => <button className={selectedValues.includes(item.name) ? "selected" : ""} onClick={() => toggleChoice(selectedValues, setSelectedValues, item.name)} key={item.name}>{item.name}<small>{item.en}</small></button>)}</div></div>
          <div className="builder-step"><div className="step-title"><span>STEP 02</span><h3>나를 움직이는 강점을 골라보세요.</h3><small>최대 3개</small></div><div className="strength-grid">{strengths.map((item) => <button className={selectedStrengths.includes(item) ? "selected" : ""} onClick={() => toggleChoice(selectedStrengths, setSelectedStrengths, item)} key={item}>{item}</button>)}</div></div>
          <div className="builder-step"><div className="step-title"><span>STEP 03</span><h3>대동에서 이루고 싶은 목표를 적어보세요.</h3><small>{visionText.length}/300</small></div><textarea maxLength={300} value={visionText} onChange={(event) => setVisionText(event.target.value)} placeholder="예: 현장의 목소리와 기술을 연결해 농업의 변화를 만드는 사람이 되겠습니다." /><button className="vision-submit" onClick={openQuiz}>Vision Map 완료 · 챌린지 시작 <span>→</span></button></div>
        </div>
      </section>

      <section className="challenge section-pad" id="challenge">
        <div className="challenge-content"><p className="eyebrow light">DAEDONG-IN CHALLENGE</p><h2>나는 얼마나<br />대동인이 되었을까?</h2><p>7개의 질문으로 대동을 다시 만나고,<br />나의 핵심가치 유형을 발견해보세요.</p><button className="challenge-button" onClick={openQuiz}>챌린지 시작하기 <span>↗</span></button></div>
        <div className="challenge-stats">
          <div><strong>{stats.count}</strong><span>누적 도전자</span></div>
          {stats.published ? <><div><strong>{stats.values?.[0]?.valueType || "-"}</strong><span>가장 많은 결과 유형</span></div><p>10명 이상의 익명 집계 결과입니다.</p></> : <><div><strong>{stats.remaining}</strong><span>통계 공개까지 남은 참여</span></div><p>10명 이상 참여하면 익명 결과가 공개됩니다.</p></>}
        </div>
      </section>

      <footer><div><img src="/images/daedong-logo.png" alt="DAEDONG" /><p>AI, 로보틱스 기반 미래농업 리딩 기업</p></div><div><p>운영 · 인사혁신팀(교육)</p><a href="mailto:mwkim@daedong.co.kr">개인정보 문의</a><button onClick={() => setPrivacyOpen(true)}>개인정보 수집·이용 안내</button><a href="/admin">관리자</a></div><small>© DAEDONG. Onboarding Journey Prototype.</small></footer>

      {videoOpen && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="대동 미래농업 영상"><div className="video-modal"><button className="modal-close" onClick={() => setVideoOpen(false)} aria-label="영상 닫기">×</button><iframe src="https://www.youtube.com/embed/vjzp4rxfxDU?autoplay=1&rel=0" title="대동이 여는 미래농업 AI TO THE FIELD" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div></div>}

      {privacyOpen && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="개인정보 수집 이용 안내"><div className="privacy-modal"><button className="modal-close dark" onClick={() => setPrivacyOpen(false)} aria-label="닫기">×</button><p className="eyebrow">PRIVACY</p><h2>개인정보 수집·이용 안내</h2><dl><dt>수집 항목</dt><dd>이름, 소속회사, 사번, 퀴즈 답변·점수, Vision Map 내용, 참여 일시</dd><dt>이용 목적</dt><dd>교육 참여 이력 확인, 교육 효과 분석 및 프로그램 개선</dd><dt>보관 기준</dt><dd>정보주체의 삭제 요청 또는 관리자의 일괄 삭제 시까지</dd><dt>열람 범위</dt><dd>지정된 교육 관리자만 원본을 열람하며, 공개 화면에는 10명 이상 집계된 통계만 표시합니다.</dd></dl><p>동의를 거부할 수 있으며, 동의하지 않을 경우 퀴즈 결과 저장이 제한됩니다. 삭제 요청: <a href="mailto:mwkim@daedong.co.kr">인사혁신팀(교육)</a></p></div></div>}

      {quizOpen && <div className="quiz-shell" role="dialog" aria-modal="true" aria-label="대동인 챌린지">
        <header><img src="/images/daedong-logo.png" alt="DAEDONG" /><div className="quiz-progress"><span style={{ width: `${result ? 100 : progress}%` }} /></div><button onClick={() => setQuizOpen(false)} aria-label="챌린지 닫기">×</button></header>
        {!result && quizStep === -1 && <div className="participant-card"><p className="eyebrow">BEFORE WE START</p><h2>당신의 여정을 기록할게요.</h2><p>참여 이력은 교육 운영과 프로그램 개선을 위해 사용됩니다.</p><label>이름<input value={participant.name} onChange={(event) => setParticipant({ ...participant, name: event.target.value })} autoComplete="name" /></label><label>소속회사<select value={participant.organization} onChange={(event) => setParticipant({ ...participant, organization: event.target.value })}>{["대동", "대동Agtech", "대동기어", "대동모빌리티", "대동AILab", "기타"].map((item) => <option key={item}>{item}</option>)}</select></label><label>사번<input value={participant.employeeNumber} onChange={(event) => setParticipant({ ...participant, employeeNumber: event.target.value })} autoComplete="off" /></label><label className="consent"><input type="checkbox" checked={participant.consent} onChange={(event) => setParticipant({ ...participant, consent: event.target.checked })} /><span>개인정보 수집·이용 안내를 확인했으며 이에 동의합니다.</span></label><button className="quiz-next" disabled={!participant.name.trim() || !participant.employeeNumber.trim() || !participant.consent} onClick={() => setQuizStep(0)}>질문 시작하기 <span>→</span></button></div>}
        {!result && currentQuestion && <div className="question-card"><div className="question-number">QUESTION {String(quizStep + 1).padStart(2, "0")} <span>{currentQuestion.category}</span></div>{currentQuestion.image && <img className="question-image" src={currentQuestion.image} alt="퀴즈 참고 이미지" />}<h2>{currentQuestion.question}</h2><div className="answer-list">{currentQuestion.options.map((option, index) => <button className={answers[currentQuestion.id] === index ? "selected" : ""} onClick={() => setAnswers({ ...answers, [currentQuestion.id]: index })} key={option}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div><div className="quiz-navigation"><button disabled={quizStep === 0} onClick={() => setQuizStep((step) => step - 1)}>이전</button><button className="quiz-next" disabled={answers[currentQuestion.id] === undefined} onClick={nextQuestion}>{quizStep === quizQuestions.length - 1 ? "결과 보기" : "다음 질문"} <span>→</span></button></div></div>}
        {result && <div className="result-card"><p className="eyebrow">YOUR DAEDONG VALUE</p><span className="result-kicker">당신은</span><h2>{result.valueType}형 대동인</h2><p className="result-description">{valueDescription[result.valueType as keyof typeof valueDescription]}</p><div className="score-ring"><strong>{result.score}</strong><span>/ {result.total}</span><small>KNOWLEDGE SCORE</small></div>{visionText && <blockquote>“{visionText}”</blockquote>}<div className={`save-state ${submitState}`}>{submitState === "saving" ? "참여 이력을 저장하고 있습니다." : submitState === "saved" ? "참여 이력이 안전하게 저장되었습니다." : submitState === "error" ? "저장에 실패했습니다. 잠시 후 다시 시도해주세요." : ""}</div><div className="result-actions"><button onClick={() => { setQuizOpen(false); document.getElementById("journey")?.scrollIntoView({ behavior: "smooth" }); }}>5일 여정 다시 보기</button><button className="quiz-next" onClick={openQuiz}>다시 도전하기 ↻</button></div></div>}
      </div>}
    </main>
  );
}
