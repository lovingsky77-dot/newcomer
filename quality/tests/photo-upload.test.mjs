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
