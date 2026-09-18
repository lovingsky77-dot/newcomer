"use client";

import { useEffect, useState } from "react";
import styles from "./PhotoGallery.module.css";

type Photo = { id: string; caption: string; fileName: string; url: string };
export default function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [limit, setLimit] = useState(6);
  const [status, setStatus] = useState("loading");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 15000);
    setStatus("loading");
    fetch("/api/photos", { cache: "no-store", signal: controller.signal })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => { setPhotos(data.photos || []); setStatus("ready"); })
      .catch(() => { setStatus("error"); })
      .finally(() => window.clearTimeout(timer));
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [retry]);
  return <section id="photos" className={styles.section} aria-labelledby="gallery-title">
    <div className={styles.heading}><div><p className={styles.label}>03 / PHOTOS</p><h2 id="gallery-title">교육 사진</h2><p>사진을 열어 크게 보거나 원하는 사진을 저장하세요.</p></div><a className={styles.upload} href="/guide#photos">사진 올리기 ↗</a></div>
    {status === "loading" && <p role="status">사진을 불러오는 중입니다.</p>}
    {status === "error" && <div role="alert"><p>사진을 불러오지 못했습니다.</p><button className={styles.more} onClick={() => setRetry((n) => n + 1)}>다시 불러오기</button></div>}
    {status === "ready" && !photos.length && <p>아직 등록된 사진이 없습니다.</p>}
    <div className={styles.grid}>{photos.slice(0, limit).map((photo, i) => <figure className={styles.item} key={photo.id}>
      <a className={styles.imageLink} href={photo.url} target="_blank" rel="noopener noreferrer" aria-label={`${photo.caption || `교육 사진 ${i + 1}`} 크게 보기 (새 창)`}><img src={photo.url} alt={photo.caption || `교육 사진 ${i + 1}`} loading="lazy" /></a>
      <figcaption><span>{photo.caption || `교육 사진 ${i + 1}`}</span><a href={`${photo.url}?download=1`} download={photo.fileName} aria-label={`${photo.caption || `교육 사진 ${i + 1}`} 다운로드`}>다운로드 ↓</a></figcaption>
    </figure>)}</div>
    {status === "ready" && photos.length > 0 && <div className={styles.bottom}><span>{Math.min(limit, photos.length)} / {photos.length}장</span>{limit < photos.length && <button className={styles.more} onClick={() => setLimit((n) => n + 6)}>사진 더 보기 +</button>}</div>}
  </section>;
}
