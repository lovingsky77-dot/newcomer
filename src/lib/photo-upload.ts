type Result = { ok?: boolean; error?: string; id?: string; chunkSize?: number };

function send(method: string, url: string, body: XMLHttpRequestBodyInit | null, onProgress: (percent: number) => void): Promise<Result> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(method, url);
    request.timeout = 120_000;
    if (typeof body === "string") request.setRequestHeader("Content-Type", "application/json");
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 100));
    };
    request.onerror = () => reject(new Error("연결이 끊겼습니다. 인터넷 연결을 확인하고 다시 시도해 주세요."));
    request.ontimeout = () => reject(new Error("업로드 시간이 초과되었습니다. 연결 상태를 확인한 뒤 다시 시도해 주세요."));
    request.onabort = () => reject(new Error("업로드가 취소되었습니다. 다시 시도해 주세요."));
    request.onload = () => {
      let data: Result = {};
      try { data = JSON.parse(request.responseText); } catch { /* Show a useful error for proxy HTML responses. */ }
      if (request.status >= 200 && request.status < 300 && data.ok) { resolve(data); return; }
      reject(new Error(data.error || (request.status === 413
        ? "사진 용량이 큽니다. 파일당 15MB 이하의 사진을 선택해 주세요."
        : "사진을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.")));
    };
    request.send(body);
  });
}

export async function uploadPhoto(file: File, caption: string, onProgress: (percent: number) => void): Promise<void> {
  if (file.size <= 512 * 1024) {
    const body = new FormData(); body.append("photos", file); body.append("caption", caption);
    await send("POST", "/api/photos", body, onProgress); return;
  }
  const types: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", heic: "image/heic", heif: "image/heif" };
  const type = file.type || types[file.name.split(".").pop()?.toLowerCase() || ""] || "";
  const session = await send("POST", "/api/photos/upload", JSON.stringify({ name: file.name, type, size: file.size, caption }), () => {});
  if (!session.id || session.chunkSize !== 512 * 1024) throw new Error("업로드를 시작하지 못했습니다. 다시 시도해 주세요.");
  const url = `/api/photos/upload?id=${encodeURIComponent(session.id)}`;
  try {
    for (let offset = 0; offset < file.size; offset += session.chunkSize) {
      const part = file.slice(offset, offset + session.chunkSize);
      await send("PUT", `${url}&index=${offset / session.chunkSize}`, part, (percent) =>
        onProgress(Math.min(99, Math.round((offset + part.size * percent / 100) / file.size * 100))));
    }
    onProgress(100);
    await send("PATCH", url, null, () => {});
  } finally {
    // Only temporary chunks are removed; the finished photo is stored separately.
    void fetch(url, { method: "DELETE" }).catch(() => {});
  }
}
