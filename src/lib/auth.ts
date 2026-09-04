import { env } from "cloudflare:workers";

const COOKIE_NAME = "dd_admin";

function runtimeEnv(name: string) {
  const bindings = env as unknown as Record<string, string | undefined>;
  return bindings[name] || (typeof process !== "undefined" ? process.env[name] : undefined) || "";
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64ToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmac(value: string) {
  const secret = runtimeEnv("SESSION_SECRET");
  if (!secret) return "";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}

export async function verifyPassword(password: string) {
  const encoded = runtimeEnv("ADMIN_PASSWORD_HASH");
  const [scheme, iterationsRaw, saltEncoded, expectedEncoded] = encoded.split(":");
  if (scheme !== "pbkdf2" || !iterationsRaw || !saltEncoded || !expectedEncoded) return false;
  const iterations = Number(iterationsRaw);
  if (!Number.isSafeInteger(iterations) || iterations < 1 || iterations > 100_000) return false;
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const derived = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: base64ToBytes(saltEncoded), iterations, hash: "SHA-256" }, material, 256));
  const expected = base64ToBytes(expectedEncoded);
  if (derived.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < derived.length; index += 1) difference |= derived[index] ^ expected[index];
  return difference === 0;
}

export function adminEmail() {
  return runtimeEnv("ADMIN_EMAIL").trim().toLowerCase();
}

export function authConfigured() {
  return Boolean(adminEmail() && runtimeEnv("ADMIN_PASSWORD_HASH") && runtimeEnv("SESSION_SECRET"));
}

export async function createAdminCookie(email: string) {
  const payload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({ email, expires: Date.now() + 1000 * 60 * 60 * 8 })));
  const signature = await hmac(payload);
  return `${COOKIE_NAME}=${payload}.${signature}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800`;
}

function cookieValue(request: Request) {
  const cookies = request.headers.get("cookie") || "";
  return cookies.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1) || "";
}

export async function isAdmin(request: Request) {
  const token = cookieValue(request);
  const separator = token.lastIndexOf(".");
  if (separator < 0) return false;
  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if ((await hmac(payload)) !== signature) return false;
  try {
    const data = JSON.parse(new TextDecoder().decode(base64ToBytes(payload))) as { email: string; expires: number };
    return data.email === adminEmail() && data.expires > Date.now();
  } catch {
    return false;
  }
}

export function clearAdminCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}
