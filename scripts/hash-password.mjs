import { Writable } from "node:stream";
import { createInterface } from "node:readline/promises";
import { hash } from "bcryptjs";

if (!process.stdin.isTTY) { console.error("Run this command in an interactive terminal."); process.exit(1); }
let muted = false;
const output = new Writable({ write(chunk, encoding, callback) { if (!muted) process.stdout.write(chunk, encoding); callback(); } });
const prompt = createInterface({ input: process.stdin, output, terminal: true });
async function hiddenQuestion(label) {
  process.stdout.write(label);
  muted = true;
  const value = await prompt.question("");
  muted = false;
  process.stdout.write("\n");
  return value;
}
try {
  const password = await hiddenQuestion("Admin password (hidden): ");
  const confirmation = await hiddenQuestion("Confirm password (hidden): ");
  if (password !== confirmation) throw new Error("Passwords do not match.");
  if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72) throw new Error("Use at least 12 characters and at most 72 UTF-8 bytes.");
  const value = await hash(password, 12);
  console.log(`For .env.local (dollar signs escaped):\nADMIN_PASSWORD_HASH='${value.replace(/\$/g, "\\$")}'`);
  console.log(`\nFor Vercel's environment-variable field (raw value):\n${value}`);
} catch (error) { console.error(error instanceof Error ? error.message : "Hash generation failed."); process.exitCode = 1; }
finally { prompt.close(); }
