import "server-only";
import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginAttemptAllowed } from "./throttle";
import { getAuthEnvironment } from "@/lib/env";
import { developmentError, developmentInfo } from "@/lib/diagnostics";

export function authConfigured() {
  try { getAuthEnvironment(); return true; }
  catch (error) { developmentError("auth", "CONFIGURATION_INCOMPLETE", error); return false; }
}
function credentialsVersion() {
  return createHmac("sha256", process.env.AUTH_SECRET!).update(`${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD_HASH}`).digest("hex");
}
export async function verifyAdminCredentials(username: string, password: string) {
  if (!authConfigured() || Buffer.byteLength(password, "utf8") > 72 || !password || username.length > 120) return false;
  // Verify the expensive hash for both correct and incorrect usernames.
  const passwordValid = await compare(password, process.env.ADMIN_PASSWORD_HASH!);
  const supplied = createHash("sha256").update(username).digest();
  const expected = createHash("sha256").update(process.env.ADMIN_USERNAME!).digest();
  return timingSafeEqual(supplied, expected) && passwordValid;
}
export function getAuthOptions(): NextAuthOptions {
  if (!authConfigured()) throw new Error("Authentication is not configured");
  const secure = process.env.NODE_ENV === "production";
  return {
    secret: process.env.AUTH_SECRET,
    useSecureCookies: secure,
    session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
    jwt: { maxAge: 8 * 60 * 60 },
    cookies: { sessionToken: { name: secure ? "__Host-feb.session" : "feb.session", options: { httpOnly: true, sameSite: "strict", path: "/", secure } } },
    pages: { signIn: "/admin/login", error: "/admin/login" },
    providers: [CredentialsProvider({
      name: "FEB administrator", credentials: { username: { label: "Username", type: "text" }, password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        try {
          if (!await loginAttemptAllowed()) { developmentInfo("auth", "login throttled"); return null; }
          if (!credentials || !await verifyAdminCredentials(credentials.username, credentials.password)) { developmentInfo("auth", "credential verification failed"); return null; }
          return { id: "feb-admin", name: "Administrator", role: "admin" };
        } catch (error) { developmentError("auth", "LOGIN_FAILED", error); return null; }
      }
    })],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.role = "admin";
          token.credentialVersion = credentialsVersion();
          token.absoluteExpiry = Date.now() + 8 * 60 * 60 * 1000;
        }
        return token;
      },
      async session({ session, token }) {
        if (token.sub !== "feb-admin" || token.role !== "admin" || token.credentialVersion !== credentialsVersion() || typeof token.absoluteExpiry !== "number" || token.absoluteExpiry <= Date.now()) {
          return { expires: session.expires };
        }
        return { expires: session.expires, user: { id: "feb-admin", name: "Administrator", role: "admin" } };
      },
      async redirect({ url, baseUrl }) {
        const target = new URL(url, baseUrl);
        return target.origin === baseUrl && (target.pathname === "/admin" || target.pathname.startsWith("/admin/")) ? target.toString() : `${baseUrl}/admin`;
      }
    },
    logger: { error() { console.error("Admin authentication request failed"); }, warn() {}, debug() {} }
  };
}
