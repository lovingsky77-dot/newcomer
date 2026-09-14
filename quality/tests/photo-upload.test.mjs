import test from "node:test";
import assert from "node:assert/strict";
import { uploadPhoto } from "../../src/lib/photo-upload.ts";

test("photo uploads settle on success, network failure, timeout and proxy errors", async () => {
  const original = globalThis.XMLHttpRequest;
  let pending;
  globalThis.XMLHttpRequest = class {
    upload = {};
    open(method, url) { assert.equal(method, "POST"); assert.equal(url, "/api/photos"); }
    send(body) { assert.equal(body.getAll("photos").length, 1); pending = this; }
  };
  try {
    const file = new File(["image"], "sample.png", { type: "image/png" });
    const progress = [];
    const success = uploadPhoto(file, "test", (value) => progress.push(value));
    assert.equal(pending.timeout, 120000);
    pending.upload.onprogress({ lengthComputable: true, loaded: 5, total: 10 });
    pending.status = 200; pending.responseText = '{"ok":true}'; pending.onload();
    await success; assert.deepEqual(progress, [50]);
    for (const [event, message] of [["onerror", /연결이 끊겼습니다/], ["ontimeout", /시간이 초과/], ["onabort", /취소/]]) {
      const result = uploadPhoto(file, "", () => {});
      const rejected = assert.rejects(result, message);
      pending[event](); await rejected;
    }
    for (const status of [413, 502]) {
      const result = uploadPhoto(file, "", () => {});
      const rejected = assert.rejects(result, status === 413 ? /15MB/ : /저장하지 못했습니다/);
      pending.status = status; pending.responseText = '<html>Error</html>'; pending.onload(); await rejected;
    }
  } finally { globalThis.XMLHttpRequest = original; }
});

test("large photos use bounded chunks, finalize once, and clean up temporary uploads", async () => {
  const original = globalThis.XMLHttpRequest;
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => { calls.push({ method: options.method, url }); return new Response(); };
  globalThis.XMLHttpRequest = class {
    upload = {};
    open(method, url) { this.method = method; this.url = url; }
    setRequestHeader() {}
    send(body) {
      calls.push({ method: this.method, url: this.url, size: body instanceof Blob ? body.size : 0 });
      this.status = 200;
      this.responseText = JSON.stringify(this.method === "POST" ? { ok: true, id: "test-session", chunkSize: 524288 } : { ok: true });
      queueMicrotask(() => this.onload());
    }
  };
  try {
    const file = new File([new Uint8Array(2 * 1024 * 1024 + 13)], "large.jpg", { type: "image/jpeg" });
    await uploadPhoto(file, "", () => {});
    assert.deepEqual(calls.map((call) => call.method), ["POST", "PUT", "PUT", "PUT", "PUT", "PUT", "PATCH", "DELETE"]);
    const chunks = calls.filter((call) => call.method === "PUT");
    assert.equal(chunks.reduce((sum, call) => sum + call.size, 0), file.size);
    assert.ok(chunks.every((call) => call.size <= 524288));
  } finally { globalThis.XMLHttpRequest = original; globalThis.fetch = originalFetch; }
});
