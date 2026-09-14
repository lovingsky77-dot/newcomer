"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import styles from "./VenueChangeNotice.module.css";

const NOTICE_END = new Date("2026-09-16T00:00:00+09:00").getTime();

export default function VenueChangeNotice() {
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const noticeKey = useRef("");

  useEffect(() => {
    if (pathname.startsWith("/admin") || Date.now() >= NOTICE_END) return;
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
    noticeKey.current = `daedong-venue-change-20260915-${day}`;
    try { if (sessionStorage.getItem(noticeKey.current)) return; } catch { /* Show the notice when storage is unavailable. */ }
    const element = dialog.current;
    if (element && !element.open) element.showModal();
    return () => { if (element?.open) element.close(); };
  }, [pathname]);

  function dismiss() {
    try { sessionStorage.setItem(noticeKey.current, "seen"); } catch { /* Closing still works without browser storage. */ }
    dialog.current?.close();
  }

  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="venue-change-title" aria-describedby="venue-change-description" onCancel={(event) => { event.preventDefault(); dismiss(); }}>
    <div className={styles.content}>
      <p className={styles.label}>교육장소 변경 안내</p>
      <h2 id="venue-change-title">2일차 교육장소가<br />변경되었습니다.</h2>
      <p className={styles.date}>9월 15일(화) · 서울사무소 오전 교육</p>
      <dl className={styles.locations}>
        <div><dt>변경 전</dt><dd><s>3층 Universe</s></dd></div>
        <div className={styles.updated}><dt>변경 후</dt><dd>5층 식당</dd></div>
      </dl>
      <p id="venue-change-description" className={styles.description}>오전 9시 교육은 서울사무소 5층 식당에서 진행됩니다. 변경된 장소로 이동해 주세요.</p>
      <p className={styles.team}>인사혁신팀(교육)</p>
      <button className={styles.confirm} type="button" onClick={dismiss} autoFocus>확인했습니다</button>
    </div>
  </dialog>;
}
