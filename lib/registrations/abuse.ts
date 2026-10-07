import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getRegistrationSecret } from "@/lib/env";

function secret() {
  return getRegistrationSecret();
}
function signature(value: string) { return createHmac("sha256", secret()).update(value).digest("hex"); }
export function issueFormToken(now = Date.now()) {
  const value = `${now}.${randomBytes(16).toString("hex")}`;
  return `${value}.${signature(value)}`;
}
export function validFormToken(token: string, now = Date.now()) {
  if (!/^\d{13}\.[a-f0-9]{32}\.[a-f0-9]{64}$/.test(token)) return false;
  const [time, nonce, supplied] = token.split(".");
  const age = now - Number(time);
  return age >= 3000 && age <= 2 * 60 * 60 * 1000 && timingSafeEqual(Buffer.from(supplied, "hex"), Buffer.from(signature(`${time}.${nonce}`), "hex"));
}
// Process-local backstop; replace this adapter with a shared production limiter.
const attempts = new Map<string, { count: number; expires: number }>();
export function allowAttempt(token: string, now = Date.now()) {
  for (const [key, item] of attempts) if (item.expires <= now) attempts.delete(key);
  const key = createHmac("sha256", secret()).update(token).digest("hex");
  const current = attempts.get(key);
  if (current && current.count >= 5) return false;
  if (!current && attempts.size >= 10000) return false;
  attempts.set(key, { count: (current?.count ?? 0) + 1, expires: current?.expires ?? now + 60000 });
  return true;
}
export async function readLimitedText(request: Request, limit = 16 * 1024) {
  if (Number(request.headers.get("content-length")) > limit) throw new RangeError("Too large");
  if (!request.body) throw new SyntaxError("Missing body");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new RangeError("Too large"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks).toString("utf8");
}
export async function readLimitedJson(request: Request) { return JSON.parse(await readLimitedText(request)); }
