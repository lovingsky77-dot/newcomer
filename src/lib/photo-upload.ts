export function uploadPhoto(file: File, caption: string, onProgress: (percent: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/photos");
    request.timeout = 120_000;
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 100));
    };
    request.onerror = () => reject(new Error("연결이 끊겼습니다. 인터넷 연결을 확인하고 다시 시도해 주세요."));
    request.ontimeout = () => reject(new Error("업로드 시간이 초과되었습니다. 연결 상태를 확인한 뒤 다시 시도해 주세요."));
    request.onabort = () => reject(new Error("업로드가 취소되었습니다. 다시 시도해 주세요."));
    request.onload = () => {
      let data: { ok?: boolean; error?: string } = {};
      try { data = JSON.parse(request.responseText); } catch { /* Show a useful error for proxy HTML responses. */ }
      if (request.status >= 200 && request.status < 300 && data.ok) { resolve(); return; }
      reject(new Error(data.error || (request.status === 413
        ? "사진 용량이 큽니다. 파일당 15MB 이하의 사진을 선택해 주세요."
        : "사진을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.")));
    };
    const body = new FormData();
    body.append("photos", file);
    body.append("caption", caption);
    request.send(body);
  });
}
