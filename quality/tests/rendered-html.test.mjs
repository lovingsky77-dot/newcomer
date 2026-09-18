import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);

test("renders the Daedong Great Journey homepage", async () => {
  const [page, layout] = await Promise.all([
    readFile(new URL("src/app/page.tsx", root), "utf8"),
    readFile(new URL("src/app/layout.tsx", root), "utf8"),
  ]);
  assert.match(page, /대동에서 시작하는/);
  assert.match(page, /AI TO THE FIELD/);
  assert.match(page, /대동인 챌린지/);
  assert.match(layout, /Great Journey/);
  assert.doesNotMatch(`${page}${layout}`, /codex-preview|Your site is taking shape|react-loading-skeleton/);
});

test("renders the education preparation guide and links it from the homepage", async () => {
  const [home, guide, experience, content] = await Promise.all([
    readFile(new URL("src/app/page.tsx", root), "utf8"),
    readFile(new URL("src/app/guide/page.tsx", root), "utf8"),
    readFile(new URL("src/app/guide/GuideExperience.tsx", root), "utf8"),
    readFile(new URL("src/lib/content.ts", root), "utf8"),
  ]);
  assert.match(home, /href="\/guide"/);
  assert.match(home, /BEFORE THE JOURNEY/);
  assert.match(home, /전체 준비 안내 확인/);
  assert.doesNotMatch(home, /prep-nav-link/);
  assert.match(guide, /참여 전 준비/);
  assert.match(guide, /href="#survey">설문조사<\/a>\s*<a href="#video">교육 영상<\/a>/);
  assert.match(guide, /<SurveyGate \/>\s*<EducationVideo \/>/);
  assert.match(guide, /이동 안내/);
  assert.match(guide, /숙박 안내/);
  assert.match(guide, /숙소 준수사항/);
  assert.doesNotMatch(guide, /2026년 3월 10일/);
  assert.match(home, /9\.14–9\.18/);
  assert.match(guide, /9\.14 MON/);
  assert.match(guide, /9\.18 FRI/);
  assert.match(guide, /1인 1실/);
  assert.match(guide, /출장비 처리/);
  assert.match(guide, /KTX-산천 312/);
  assert.doesNotMatch(experience, /RESPONSE DEADLINE|9\.13 SUN · 23:59/);
  assert.match(experience, /return <SurveyInvitation \/>/);
  assert.match(experience, /사진 업로드/);
  assert.match(experience, /셔틀버스 이동/);
  assert.match(experience, /자차 이동/);
  assert.doesNotMatch(experience, /사번|기타 이동/);
  assert.doesNotMatch(experience, /교육 시작일 이동 방법/);
  assert.doesNotMatch(guide, /2인 1실|기본 상비약|교통비 처리/);
  assert.match(content, /자기비저닝\(팀빌딩\)/);
  assert.match(content, /S-Factory 투어/);
  assert.doesNotMatch(`${home}${guide}${content}`, /9\.7–9\.11|date: "9\/7"|date: "9\/11"/);
});

test("offers the survey immediately on the homepage and guide with a QR code", async () => {
  const home = await readFile(new URL("src/app/page.tsx", root), "utf8");
  const survey = await readFile(new URL("src/app/SurveyInvitation.tsx", root), "utf8");
  const qr = await readFile(new URL("public/images/survey-qr.png", root));
  assert.match(home, /<SurveyInvitation home \/>/);
  assert.ok(home.indexOf("<SurveyInvitation home") < home.indexOf('<section className="hero"'));
  assert.match(survey, /https:\/\/forms\.gle\/NpjGdEaW2Jw9zqaB6/);
  assert.match(survey, /지금 참여 가능/);
  assert.match(survey, /survey-qr\.png/);
  assert.doesNotMatch(survey, /Date\.now|disabled|SURVEY_OPEN_AT/);
  assert.equal(qr.subarray(1, 4).toString(), "PNG");
});

test("keeps credentials and local data out of the public repository", async () => {
  const [ignore, example, page] = await Promise.all([
    readFile(new URL(".gitignore", root), "utf8"),
    readFile(new URL(".env.example", root), "utf8"),
    readFile(new URL("src/app/page.tsx", root), "utf8"),
  ]);
  assert.match(ignore, /\.env\*/);
  assert.match(ignore, /\/\.wrangler\//);
  assert.match(example, /ADMIN_PASSWORD_HASH/);
  assert.doesNotMatch(page, /ADMIN_PASSWORD|SESSION_SECRET/);
});

test("provides private anonymous inquiry entry points and a conversation flow", async () => {
  const [home, guide, inquiry, api] = await Promise.all([
    readFile(new URL("src/app/page.tsx", root), "utf8"),
    readFile(new URL("src/app/guide/page.tsx", root), "utf8"),
    readFile(new URL("src/app/inquiry/page.tsx", root), "utf8"),
    readFile(new URL("src/app/api/inquiries/thread/route.ts", root), "utf8"),
  ]);
  assert.match(home, /href="\/inquiry"/);
  assert.match(guide, /href="\/inquiry"/);
  assert.match(inquiry, /문의 등록/);
  assert.match(inquiry, /문의 링크/);
  assert.match(inquiry, /확인코드/);
  assert.match(inquiry, /Q-123456/);
  assert.match(inquiry, /1234-5678/);
  assert.match(inquiry, /메시지 보내기/);
  assert.doesNotMatch(inquiry, /type="file"|파일 첨부/);
  assert.match(api, /findAuthorizedInquiry/);
});
