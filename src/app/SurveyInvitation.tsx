import styles from "./SurveyInvitation.module.css";

const SURVEY_URL = "https://forms.gle/NpjGdEaW2Jw9zqaB6";

export default function SurveyInvitation({ home = false }: { home?: boolean }) {
  return (
    <section id="survey" className={`${styles.section} ${home ? styles.home : ""}`} aria-labelledby="survey-title">
      <div className={styles.copy}>
        <span className={styles.status}>지금 참여 가능</span>
        <h2 id="survey-title">교육 만족도 조사</h2>
        <p>5일간의 교육에 대한 의견을 남겨주세요.</p>
        <a className={styles.button} href={SURVEY_URL} target="_blank" rel="noopener noreferrer" aria-label="설문 참여하기 (새 창)">설문 참여하기 <span aria-hidden="true">↗</span></a>
      </div>
      <figure className={styles.qr}>
        <a href={SURVEY_URL} target="_blank" rel="noopener noreferrer" aria-label="QR코드 대신 설문 링크 열기 (새 창)"><img src="/images/survey-qr.png" width="164" height="164" alt="교육 만족도 설문 참여 QR코드" /></a>
        <figcaption>카메라로 QR코드를 스캔하세요.</figcaption>
        <a className={styles.download} href="/images/survey-qr.png" download="DAEDONG-survey-QR.png">QR코드 저장 ↓</a>
      </figure>
      {home && <nav className={styles.shortcuts} aria-label="교육 마무리 바로가기"><a href="#survey">01 <span>만족도 조사</span></a><a href="#video">02 <span>교육 동영상</span></a><a href="#photos">03 <span>교육 사진</span></a></nav>}
    </section>
  );
}
