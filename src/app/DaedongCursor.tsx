"use client";

import { useEffect, useRef } from "react";

export default function DaedongCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

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

  return <div className="daedong-cursor" ref={cursorRef} aria-hidden="true"><span /></div>;
}
