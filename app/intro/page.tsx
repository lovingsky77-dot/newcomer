import type { Metadata } from "next";
import "./intro.css";

const liveSite = "https://daedong-great-journey.noakim93.chatgpt.site/";

export const metadata: Metadata = {
  title: "대동 Great Journey | 디지털 온보딩 경험 소개",
  description: "대동의 미래와 나의 역할을 연결하는 5일간의 디지털 온보딩 경험을 소개합니다.",
};

const highlights = [
  {
    number: "01",
    label: "UNDERSTAND",
    title: "회사를 읽는\n하나의 이야기",
    body: "비전과 핵심가치, 미래사업을 흩어진 정보가 아닌 하나의 서사로 이해합니다.",
  },
  {
    number: "02",
    label: "EXPERIENCE",
    title: "5일의 여정을\n미리 경험",
    body: "서울부터 창녕까지 이어지는 교육 흐름과 매일의 목적을 한눈에 살펴봅니다.",
  },
  {
    number: "03",
    label: "DISCOVER",
    title: "나의 방향을\n직접 발견",
    body: "Vision Map과 대동인 챌린지를 통해 나의 가치, 강점, 목표를 연결합니다.",
  },
];

const journey = [
  ["MEET", "회사와 나의 비전 찾기"],
  ["DISCOVER", "대동의 미래와 사업 이해"],
  ["EXPERIENCE", "체험으로 완성하는 대동인화"],
];

const features = [
  { index: "01", title: "5일 여정 가이드", body: "일차별 장소와 프로그램, 배움의 흐름을 인터랙티브 일정으로 확인합니다." },
  { index: "02", title: "미래사업 탐색", body: "정밀농업·로보틱스·스마트파밍·AI 에이전트·커넥티드의 연결을 이해합니다." },
  { index: "03", title: "My Vision Map", body: "대동의 핵심가치와 나의 강점을 선택하고, 앞으로의 목표를 한 문장으로 완성합니다." },
  { index: "04", title: "대동인 챌린지", body: "7개의 질문을 풀며 배운 내용을 돌아보고 나의 핵심가치 유형을 발견합니다." },
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function IntroPage() {
  return (
    <main className="intro-page" id="intro-top">
      <header className="intro-header">
        <a className="intro-brand" href="#intro-top" aria-label="소개 페이지 처음으로">
          <img src="/images/daedong-logo.png" alt="DAEDONG" />
          <span>GREAT JOURNEY</span>
        </a>
        <nav aria-label="소개 페이지 메뉴">
          <a href="#about">경험 소개</a>
          <a href="#inside">주요 콘텐츠</a>
        </nav>
        <a className="header-link" href={liveSite} target="_blank" rel="noreferrer">
          사이트 방문 <Arrow />
        </a>
      </header>

      <section className="intro-hero" aria-labelledby="intro-title">
        <img className="intro-hero-image" src="/images/ai-field-hero.png" alt="AI 기반 미래 농업 현장" />
        <div className="intro-hero-overlay" />
        <div className="intro-hero-copy">
          <p className="intro-kicker">DAEDONG DIGITAL ONBOARDING EXPERIENCE</p>
          <h1 id="intro-title">
            대동을 만나는<br />
            <em>첫 번째 여정.</em>
          </h1>
          <p className="intro-lead">
            농업의 미래를 이해하고,<br />
            대동에서의 나를 설계하는 인터랙티브 온보딩 사이트
          </p>
          <div className="intro-actions">
            <a className="intro-primary" href={liveSite} target="_blank" rel="noreferrer">
              Great Journey 시작하기 <Arrow />
            </a>
            <a className="intro-secondary" href="#about">프로젝트 살펴보기 <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <div className="hero-index" aria-hidden="true"><b>01</b><span />05</div>
        <p className="hero-side" aria-hidden="true">AI TO THE FIELD · GREAT JOURNEY</p>
      </section>

      <section className="intro-statement" id="about">
        <div className="section-code">01 / PROJECT</div>
        <div className="statement-copy">
          <p className="intro-kicker dark">WHY THIS EXPERIENCE</p>
          <h2>
            정보는 읽는 순간보다,<br />
            <span>나와 연결되는 순간</span> 오래 남습니다.
          </h2>
          <p>
            Great Journey는 신입 구성원이 대동의 사업과 문화를 스스로 탐색하고,
            5일의 현장 교육을 자신의 성장 이야기로 연결하도록 설계한 디지털 온보딩 경험입니다.
          </p>
        </div>
      </section>

      <section className="highlight-grid" aria-label="프로젝트 핵심 가치">
        {highlights.map((item) => (
          <article key={item.number}>
            <div><span>{item.number}</span><small>{item.label}</small></div>
            <h3>{item.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </section>

      <section className="journey-story">
        <div className="journey-visual">
          <img src="/images/future-overview.png" alt="미래 농업을 이끄는 대동의 기술" />
          <div className="visual-caption"><span>5 DAYS</span><b>ONE<br />JOURNEY</b></div>
        </div>
        <div className="journey-copy">
          <div className="section-code light">02 / JOURNEY</div>
          <p className="intro-kicker">THREE MEANINGFUL TRANSITIONS</p>
          <h2>낯섦에서 이해로,<br />이해에서 확신으로.</h2>
          <p className="journey-description">다섯 날의 교육을 세 가지 전환으로 압축해, 참여자가 지금 어디에 있고 무엇을 향해 가는지 놓치지 않게 합니다.</p>
          <ol>
            {journey.map(([en, ko], index) => (
              <li key={en}><span>0{index + 1}</span><strong>{en}</strong><p>{ko}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="inside" id="inside">
        <div className="inside-heading">
          <div className="section-code">03 / INSIDE</div>
          <div>
            <p className="intro-kicker dark">WHAT YOU CAN EXPERIENCE</p>
            <h2>보고, 선택하고,<br />나만의 답을 만듭니다.</h2>
          </div>
        </div>
        <div className="feature-list">
          {features.map((feature) => (
            <article key={feature.index}>
              <span>{feature.index}</span>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
              <i aria-hidden="true">↗</i>
            </article>
          ))}
        </div>
      </section>

      <section className="preview-section">
        <div className="preview-copy">
          <div className="section-code light">04 / PREVIEW</div>
          <p className="intro-kicker">DESIGNED TO EXPLORE</p>
          <h2>스크롤할수록<br />선명해지는 대동.</h2>
          <p>현장감 있는 이미지, 강한 타이포그래피, 직접 참여하는 콘텐츠로 온보딩의 몰입을 높였습니다.</p>
        </div>
        <div className="browser-frame" aria-label="Great Journey 사이트 미리보기">
          <div className="browser-bar"><i /><i /><i /><span>daedong-great-journey</span></div>
          <div className="browser-screen">
            <img src="/images/ai-field-hero.png" alt="Great Journey 첫 화면 미리보기" />
            <div>
              <small>AI TO THE FIELD · GREAT JOURNEY</small>
              <strong>대동에서 시작하는<br />Great Journey</strong>
              <span>농업의 미래를 이해하고, 나의 미래를 설계하는 5일</span>
            </div>
          </div>
        </div>
      </section>

      <section className="closing">
        <img src="/images/future-02.png" alt="AI와 연결된 미래 농업" />
        <div className="closing-overlay" />
        <div className="closing-content">
          <p className="intro-kicker">YOUR GREAT JOURNEY STARTS HERE</p>
          <h2>이제, 대동에서의<br />나를 그려볼 차례입니다.</h2>
          <a href={liveSite} target="_blank" rel="noreferrer">사이트 방문하기 <Arrow /></a>
        </div>
      </section>

      <footer className="intro-footer">
        <div><img src="/images/daedong-logo.png" alt="DAEDONG" /><span>AI, 로보틱스 기반 미래농업 리딩 기업</span></div>
        <p>Great Journey · Digital Onboarding Experience</p>
        <a href="#intro-top">TOP ↑</a>
      </footer>
    </main>
  );
}
