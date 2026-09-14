import type { Metadata } from "next";
import Link from "next/link";
import { JourneyCountdown, LogisticsResponse, PhotoBoard, SurveyGate } from "./GuideExperience";

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
          <Link href="/inquiry">문의하기</Link>
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
          <h1>참여 전 준비</h1>
          <p>교육 일정과 이동·숙박 안내를 확인해 주세요.</p>
        </div>
        <dl className="guide-date-card">
          <div>
            <dt>START</dt>
            <dd>9.14 MON<br /><strong>11:00</strong></dd>
          </div>
          <div>
            <dt>FINISH</dt>
            <dd>9.18 FRI<br /><strong>13:30</strong></dd>
          </div>
          <div>
            <dt>STAY</dt>
            <dd><strong>1인 1실</strong><br />비전캠퍼스</dd>
          </div>
        </dl>
      </section>

      <JourneyCountdown />

      <nav className="guide-tabs" aria-label="준비 안내 바로가기">
        <a href="#travel">이동 안내</a>
        <a href="#before">참여 전 준비</a>
        <a href="#stay">숙박 안내</a>
        <a href="#response">숙박·이동 응답</a>
        <a href="#photos">사진 기록</a>
        <a href="#survey">설문조사</a>
        <a href="#rules">숙소 준수사항</a>
        <Link href="/inquiry">문의하기 ↗</Link>
      </nav>

      <section className="guide-section guide-travel" id="travel">
        <div className="guide-section-title inverse">
          <span>01</span>
          <div>
            <p className="eyebrow light">HOW TO ARRIVE</p>
            <h2>이동 안내</h2>
          </div>
        </div>
        <div className="travel-board">
          <article>
            <div className="travel-label">
              <span>9.14</span>
              <strong>교육 시작</strong>
            </div>
            <div className="travel-content">
              <h3>월요일 오전 10시 50분까지</h3>
              <p>교육 시작일(9/14) 서울 근무자는 서울사무소 3층 Universe로 집결합니다. 타지역 근무자는 아래 권장 열차를 확인해 주세요.</p>
              <p><strong>2일차(9/15) 장소 변경: 서울사무소 3층 Universe → 5층 식당</strong><br />오전 9시 교육부터 5층 식당에서 진행됩니다.</p>
              <div className="train-grid">
                <div>
                  <small>KTX 102</small>
                  <strong>동대구역 → 서울역</strong>
                  <span>교육 시작일 권장 열차</span>
                </div>
                <div>
                  <small>KTX 012</small>
                  <strong>동대구역 → 서울역</strong>
                  <span>교육 시작일 권장 열차</span>
                </div>
                <div>
                  <small>KTX-산천 312</small>
                  <strong>동대구역 → 수서역</strong>
                  <span>교육 시작일 권장 열차</span>
                </div>
              </div>
            </div>
          </article>
          <article>
            <div className="travel-label">
              <span>9.18</span>
              <strong>교육 종료</strong>
            </div>
            <div className="travel-content">
              <h3>금요일 오후 1시 30분</h3>
              <div className="departure-grid">
                <div>
                  <small>RETURN TRAIN</small>
                  <p>교육 종료 후 이동시간을 고려해<br /><b>오후 2시 30분 이후 열차</b>를 예약해 주세요.</p>
                </div>
                <div>
                  <small>BUSINESS TRIP</small>
                  <p>이동간 발생한 교통비는<br /><b>그룹사 출장비 규정</b>에 따라 처리됩니다.</p>
                </div>
                <div>
                  <small>SUPPORT</small>
                  <p>교육 중 숙박과 식대는<br /><b>별도로 제공될 예정</b>입니다.</p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="guide-section" id="before">
        <div className="guide-section-title">
          <span>02</span>
          <div>
            <p className="eyebrow">GET READY</p>
            <h2>참여 전 준비</h2>
          </div>
        </div>
        <div className="guide-card-grid">
          <article className="guide-card feature">
            <span className="guide-card-no">MUST PACK</span>
            <h3>필수 지참</h3>
            <ul>
              <li>개인 세면도구 및 수건</li>
              <li>저녁시간 활동복</li>
              <li>개인 의약품</li>
            </ul>
          </article>
          <article className="guide-card">
            <span className="guide-card-no">DRESS</span>
            <h3>편안하고 깔끔하게</h3>
            <p>활동하기 좋은 단정한 사복을 권장합니다. 트레이닝복과 찢어진 청바지는 지양해 주세요. 근무복 착용은 개인 선택사항입니다.</p>
          </article>
          <article className="guide-card">
            <span className="guide-card-no">EXPENSE</span>
            <h3>출장비 처리</h3>
            <p>이동간 발생한 교통비는 각 그룹사의 출장비 규정에 따라 처리됩니다. 교육 중 숙박과 식대는 별도로 제공될 예정입니다.</p>
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
            <strong>1</strong>
            <span>PERSON / ROOM</span>
            <h3>1인 1실로<br />배정됩니다.</h3>
            <p>비전캠퍼스 내에는 세면도구를 구매할 수 있는 시설이 없습니다.</p>
          </div>
          <div className="stay-checklist">
            <article className="accent">
              <span>필수 지참</span>
              <h3>세면도구 · 수건</h3>
              <p>개인 세면도구와 수건을 반드시 챙겨 주세요.</p>
            </article>
            <article>
              <span>구비 품목</span>
              <h3>샴푸 · 치약</h3>
              <p>객실에는 샴푸와 치약만 준비되어 있습니다.</p>
            </article>
            <article>
              <span>개인 의약품</span>
              <h3>필요한 약 직접 준비</h3>
              <p>개인에게 필요한 약은 반드시 별도로 준비해 주세요.</p>
            </article>
          </div>
        </div>
      </section>

      <LogisticsResponse />

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

      <PhotoBoard />
      <SurveyGate />

      <section className="guide-inquiry-cta" aria-labelledby="guide-inquiry-title">
        <div>
          <p className="eyebrow light">1:1 INQUIRY</p>
          <h2 id="guide-inquiry-title">문의게시판</h2>
          <p>교육 일정, 이동·숙박, 준비사항에 관한 문의를 비공개로 남길 수 있습니다.</p>
        </div>
        <div className="guide-inquiry-info">
          <ul>
            <li><span>01</span>문의 내용은 공개되지 않습니다.</li>
            <li><span>02</span>교육 관리자만 내용을 확인합니다.</li>
            <li><span>03</span>발급된 문의번호로 답변을 확인합니다.</li>
          </ul>
          <Link href="/inquiry">문의 작성 및 확인 <span>→</span></Link>
        </div>
      </section>

      <section className="guide-contact" aria-labelledby="guide-contact-title">
        <div>
          <p className="eyebrow">CONTACT</p>
          <h2 id="guide-contact-title">교육 담당자</h2>
          <p>인사혁신팀(교육)</p>
        </div>
        <a href="mailto:mwkim@daedong.co.kr">
          <span>EMAIL</span><strong>mwkim@daedong.co.kr</strong><b>↗</b>
        </a>
      </section>

      <footer className="guide-footer">
        <div className="guide-footer-brand">
          <img src="/images/daedong-logo.png" alt="DAEDONG" />
          <p>2026 하반기 Great Journey<br />교육 준비 안내</p>
        </div>
        <nav aria-label="하단 메뉴">
          <Link href="/">홈</Link>
          <Link href="/inquiry">문의게시판</Link>
          <a href="mailto:mwkim@daedong.co.kr">교육 담당자</a>
        </nav>
        <small>© DAEDONG. All rights reserved.</small>
      </footer>
    </main>
  );
}
