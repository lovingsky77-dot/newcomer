import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "교육 준비 안내 | DAEDONG Great Journey",
  description: "2026년 하반기 대동 신규입사자 교육 참여 전 준비사항과 비전캠퍼스 숙박 안내",
};

const stayRules = [
  "숙소를 청결하게 사용하고 정리정돈을 철저히 합니다.",
  "등록된 전열기 외 기기는 비전캠퍼스 사무실의 사전 허락 후 사용합니다.",
  "다른 교육생에게 피해를 주지 않도록 배려합니다.",
  "외부 출입 시 경비원에게 알리고 열쇠를 경비실에 보관합니다.",
  "사용자 과실로 시설물·집기 등에 피해가 발생하면 즉시 알리고 변상 조치합니다.",
  "신체·재산·인명 사고 등 유사 사고가 발생하지 않도록 안전수칙을 준수합니다.",
  "현금 등 귀중품은 본인이 직접 보관합니다.",
  "비전캠퍼스에서 별도로 안내하는 사항을 준수합니다.",
];

const prohibited = [
  "지정 숙박자 외 출입·숙박",
  "숙소 내 음주·고성방가·소란행위",
  "숙소 내 취사",
  "건물 내 흡연",
  "외부 음식물 반입",
  "22시 이후 입실",
  "주류 반입",
  "지정된 숙소 외 출입",
];

export default function GuidePage() {
  return (
    <main className="guide-page">
      <header className="guide-header">
        <Link className="brand" href="/" aria-label="대동 Great Journey 홈">
          <img src="/images/daedong-logo.png" alt="DAEDONG" />
        </Link>
        <nav aria-label="안내 페이지 메뉴">
          <Link href="/#journey">5일의 여정</Link>
          <Link href="/#future">미래사업</Link>
          <Link href="/#vision">Vision Map</Link>
        </nav>
        <div className="guide-header-actions">
          <span className="guide-current" aria-current="page">
            <small>CHECK</small> 참여 전 준비
          </span>
          <Link className="guide-home-link" href="/">
            홈 <span>↗</span>
          </Link>
        </div>
      </header>

      <section className="guide-hero">
        <div className="guide-hero-grid" aria-hidden="true" />
        <div className="guide-hero-copy">
          <p className="eyebrow light">BEFORE THE JOURNEY</p>
          <h1>가볍게 준비하고,<br />온전히 몰입하세요.</h1>
          <p>출발부터 숙박까지 꼭 필요한 내용만 한눈에 확인하세요.</p>
        </div>
        <dl className="guide-date-card">
          <div>
            <dt>START</dt>
            <dd>9.7 MON<br /><strong>12:30</strong></dd>
          </div>
          <div>
            <dt>FINISH</dt>
            <dd>9.11 FRI<br /><strong>13:30</strong></dd>
          </div>
          <div>
            <dt>STAY</dt>
            <dd><strong>2인 1실</strong><br />비전캠퍼스</dd>
          </div>
        </dl>
      </section>

      <nav className="guide-tabs" aria-label="준비 안내 바로가기">
        <a href="#before">참여 전 준비</a>
        <a href="#travel">이동 안내</a>
        <a href="#stay">숙박 안내</a>
        <a href="#rules">숙소 준수사항</a>
      </nav>

      <section className="guide-section" id="before">
        <div className="guide-section-title">
          <span>01</span>
          <div>
            <p className="eyebrow">GET READY</p>
            <h2>참여 전 준비</h2>
          </div>
        </div>
        <div className="guide-card-grid">
          <article className="guide-card feature">
            <span className="guide-card-no">DRESS</span>
            <h3>편안하고 깔끔하게</h3>
            <p>활동하기 좋은 단정한 사복을 권장합니다. 트레이닝복과 찢어진 청바지는 지양해 주세요. 근무복 착용은 개인 선택사항입니다.</p>
          </article>
          <article className="guide-card">
            <span className="guide-card-no">PACK</span>
            <h3>꼭 챙겨 주세요</h3>
            <ul>
              <li>개인 위생용품</li>
              <li className="highlight">개인 수건 (필수)</li>
              <li>저녁시간 활동복</li>
              <li>개인 상비약</li>
            </ul>
          </article>
          <article className="guide-card">
            <span className="guide-card-no">EXPENSE</span>
            <h3>교통비 처리</h3>
            <p>교육 시작 전과 종료 후 사용한 교통비는 각 그룹사의 출장비 규정에 따라 처리합니다.</p>
          </article>
        </div>
      </section>

      <section className="guide-section guide-travel" id="travel">
        <div className="guide-section-title inverse">
          <span>02</span>
          <div>
            <p className="eyebrow light">HOW TO ARRIVE</p>
            <h2>이동 안내</h2>
          </div>
        </div>
        <div className="travel-board">
          <article>
            <div className="travel-label">
              <span>9.7</span>
              <strong>교육 시작</strong>
            </div>
            <div className="travel-content">
              <h3>월요일 오후 12시 30분</h3>
              <p>대중교통 이용자는 열차를 개인 예약한 뒤 이동합니다.</p>
              <div className="train-grid">
                <div>
                  <small>KTX 318</small>
                  <strong>10:01 → 11:46</strong>
                  <span>수서역 도착</span>
                </div>
                <div>
                  <small>KTX 018</small>
                  <strong>09:32 → 11:24</strong>
                  <span>서울역 도착</span>
                </div>
                <div>
                  <small>KTX 020</small>
                  <strong>09:38 → 11:28</strong>
                  <span>서울역 도착</span>
                </div>
              </div>
            </div>
          </article>
          <article>
            <div className="travel-label">
              <span>9.11</span>
              <strong>교육 종료</strong>
            </div>
            <div className="travel-content">
              <h3>금요일 오후 1시 30분</h3>
              <div className="departure-grid">
                <div>
                  <small>서울권 교육생</small>
                  <p>셔틀버스로 동대구역 이동<br /><b>예상 도착 오후 3시</b></p>
                </div>
                <div>
                  <small>대구권 교육생</small>
                  <p>동일 셔틀버스로 용산역<br /><b>대구 지하철 2호선 하차</b></p>
                </div>
                <div>
                  <small>개별 이동</small>
                  <p>별도 개인 이동도<br /><b>가능합니다.</b></p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="guide-section" id="stay">
        <div className="guide-section-title">
          <span>03</span>
          <div>
            <p className="eyebrow">VISION CAMPUS</p>
            <h2>숙박 안내</h2>
          </div>
        </div>
        <div className="stay-layout">
          <div className="stay-lead">
            <strong>2</strong>
            <span>PERSON / ROOM</span>
            <h3>2인 1실로<br />배정됩니다.</h3>
            <p>비전캠퍼스 내에는 세면도구를 구매할 수 있는 시설이 없습니다.</p>
          </div>
          <div className="stay-checklist">
            <article>
              <span>구비 품목</span>
              <h3>샴푸 · 치약</h3>
              <p>객실에는 샴푸와 치약만 준비되어 있습니다.</p>
            </article>
            <article className="accent">
              <span>필수 지참</span>
              <h3>세면도구 · 수건</h3>
              <p>개인 세면도구와 수건을 반드시 챙겨 주세요.</p>
            </article>
            <article>
              <span>상비약</span>
              <h3>두통 · 감기 · 소화제</h3>
              <p>기본 상비약은 구비되어 있으며, 개인에게 필요한 약은 별도로 준비합니다.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="guide-section rules-section" id="rules">
        <div className="guide-section-title inverse">
          <span>04</span>
          <div>
            <p className="eyebrow light">MUST READ</p>
            <h2>숙소 준수사항</h2>
          </div>
        </div>
        <p className="rules-intro">모두가 안전하고 편안하게 머물 수 있도록 아래 내용을 반드시 확인해 주세요.</p>
        <ol className="rule-list">
          {stayRules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ol>
        <div className="prohibited-box">
          <div>
            <p className="eyebrow light">NOT ALLOWED</p>
            <h3>숙소 내 금지사항</h3>
            <p>위반 시 즉시 퇴실 조치될 수 있습니다.</p>
          </div>
          <ul>
            {prohibited.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="guide-contact">
        <p className="eyebrow">NEED HELP?</p>
        <h2>궁금한 점은<br />교육 담당자에게 문의하세요.</h2>
        <a href="mailto:mwkim@daedong.co.kr">
          mwkim@daedong.co.kr <span>↗</span>
        </a>
        <p>인사혁신팀(교육)</p>
      </section>

      <footer className="guide-footer">
        <img src="/images/daedong-logo.png" alt="DAEDONG" />
        <p>2026 하반기 Great Journey · 교육 준비 안내</p>
        <Link href="/">홈으로 돌아가기</Link>
      </footer>
    </main>
  );
}
