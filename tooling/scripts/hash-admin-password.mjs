import { pbkdf2Sync, randomBytes } from "node:crypto";

const password = process.env.NEW_ADMIN_PASSWORD;
if (!password) {
  console.error("NEW_ADMIN_PASSWORD 환경변수에 새 관리자 비밀번호를 입력해주세요.");
  process.exit(1);
}

const iterations = 210_000;
const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256");
const encode = (value) => value.toString("base64url");
console.log(`pbkdf2:${iterations}:${encode(salt)}:${encode(hash)}`);
