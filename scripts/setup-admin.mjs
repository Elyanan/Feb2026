import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { Writable } from "node:stream";
import { createInterface } from "node:readline/promises";
import { hash } from "bcryptjs";
import nextEnv from "@next/env";

if (!process.stdin.isTTY) {
  console.error("Run npm run setup:admin in an interactive terminal.");
  process.exit(1);
}
nextEnv.loadEnvConfig(process.cwd());
let muted = false;
const output = new Writable({ write(chunk, encoding, callback) {
  if (!muted) process.stdout.write(chunk, encoding);
  callback();
} });
const prompt = createInterface({ input: process.stdin, output, terminal: true });
async function passwordQuestion(label) {
  process.stdout.write(label);
  muted = true;
  try { return await prompt.question(""); }
  finally { muted = false; process.stdout.write("\n"); }
}
try {
  const existingUsername = process.env.ADMIN_USERNAME || "";
  const username = (await prompt.question(`Admin username${existingUsername ? ` [${existingUsername}]` : ""}: `)).trim() || existingUsername;
  if (!username || username.length > 120 || /[\r\n\x00]/.test(username)) throw new Error("Enter a valid username (1-120 characters).");
  const password = await passwordQuestion("New admin password (hidden, at least 12 characters): ");
  const confirmation = await passwordQuestion("Confirm password (hidden): ");
  if (password !== confirmation) throw new Error("Passwords do not match. No settings changed.");
  if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72) throw new Error("Use at least 12 characters and at most 72 UTF-8 bytes. No settings changed.");
  const values = {
    ADMIN_USERNAME: username,
    ADMIN_PASSWORD_HASH: await hash(password, 12),
    AUTH_SECRET: process.env.AUTH_SECRET?.length >= 32 ? process.env.AUTH_SECRET : randomBytes(32).toString("hex"),
    REGISTRATION_FORM_SECRET: process.env.REGISTRATION_FORM_SECRET?.length >= 32 ? process.env.REGISTRATION_FORM_SECRET : randomBytes(32).toString("hex"),
  };
  let source = await readFile(".env.local", "utf8").catch(error => {
    if (error.code === "ENOENT") return "";
    throw error;
  });
  for (const [key, value] of Object.entries(values)) {
    const line = `${key}=${JSON.stringify(value).replace(/\$/g, "\\$")}`;
    const pattern = new RegExp(`^${key}=.*$`, "m");
    source = pattern.test(source) ? source.replace(pattern, () => line) : `${source.trimEnd()}\n${line}\n`;
  }
  await writeFile(".env.local", source, { mode: 0o600 });
  console.log("Admin setup saved in .env.local. Your password was hashed; no plaintext password was saved.");
  console.log("Restart npm run dev, then open http://127.0.0.1:3000/admin/login.");
} catch (error) {
  console.error(error instanceof Error ? error.message : "Setup failed.");
  process.exitCode = 1;
} finally { prompt.close(); }
