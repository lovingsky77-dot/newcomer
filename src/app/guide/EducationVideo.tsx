import styles from "./EducationVideo.module.css";

export default function EducationVideo() {
  return <section className={styles.section} id="video" aria-labelledby="education-video-title">
    <div className={styles.heading}>
      <div><p className={styles.label}>02 / FILM</p><h2 id="education-video-title">교육 동영상</h2><p>함께한 5일의 기록 · 2분 · Full HD</p></div>
      <a className={styles.download} href="/videos/great-journey-2026-1080p.mp4" download="DAEDONG_Great_Journey_FullHD.mp4">영상 다운로드 <span aria-hidden="true">↓</span></a>
    </div>
    <video className={styles.player} controls playsInline preload="none" poster="/images/education-video-poster.jpg" aria-label="대동 Great Journey 교육 영상, 2분">
      <source src="/videos/great-journey-2026-1080p.mp4" type="video/mp4" />
      영상을 재생할 수 없는 경우 위의 영상 다운로드를 이용해 주세요.
    </video>
    <p className={styles.note}>재생 버튼을 눌러 시청하세요. 현장 상영 시 전체화면으로 재생할 수 있습니다.</p>
  </section>;
}
