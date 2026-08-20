import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("renders the Daedong Great Journey homepage", async () => {
  const [page, layout] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
  ]);
  assert.match(page, /대동에서 시작하는/);
  assert.match(page, /AI TO THE FIELD/);
  assert.match(page, /대동인 챌린지/);
  assert.match(layout, /Great Journey/);
  assert.doesNotMatch(`${page}${layout}`, /codex-preview|Your site is taking shape|react-loading-skeleton/);
});

test("renders the education preparation guide and links it from the homepage", async () => {
  const [home, guide] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/guide/page.tsx", root), "utf8"),
  ]);
  assert.match(home, /href="\/guide"/);
  assert.match(home, /BEFORE THE JOURNEY/);
  assert.match(home, /전체 준비 안내 확인/);
  assert.doesNotMatch(home, /prep-nav-link/);
  assert.match(guide, /참여 전 준비/);
  assert.match(guide, /이동 안내/);
  assert.match(guide, /숙박 안내/);
  assert.match(guide, /숙소 준수사항/);
  assert.doesNotMatch(guide, /2026년 3월 10일/);
});

test("keeps credentials and local data out of the public repository", async () => {
  const [ignore, example, page] = await Promise.all([
    readFile(new URL(".gitignore", root), "utf8"),
    readFile(new URL(".env.example", root), "utf8"),
    readFile(new URL("app/page.tsx", root), "utf8"),
  ]);
  assert.match(ignore, /\.env\*/);
  assert.match(ignore, /\/\.wrangler\//);
  assert.match(example, /ADMIN_PASSWORD_HASH/);
  assert.doesNotMatch(page, /ADMIN_PASSWORD|SESSION_SECRET/);
});
