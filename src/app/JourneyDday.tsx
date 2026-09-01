"use client";

import { useEffect, useState } from "react";

const START_AT = new Date("2026-09-14T11:00:00+09:00").getTime();

export default function JourneyDday() {
  const [now, setNow] = useState(START_AT);
  useEffect(() => {
    const firstTick = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { window.clearTimeout(firstTick); window.clearInterval(timer); };
  }, []);
  const diff = Math.max(0, START_AT - now);
  const seconds = Math.floor(diff / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return <div className="hero-dday" aria-live="polite">
    <span>{diff > 0 ? `D-${days}` : "NOW"}</span>
    <p>{diff > 0 ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")} 남음` : "Great Journey가 시작되었습니다"}</p>
  </div>;
}
