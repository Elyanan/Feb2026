import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { authConfigured, getAuthOptions } from "@/lib/auth/config";
import { privateJson, sameOrigin } from "@/lib/admin/http";
import { readLimitedText } from "@/lib/registrations/abuse";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ nextauth: string[] }> };
async function handler(request: NextRequest, context: Context) {
  if (!authConfigured()) return privateJson({ message: "Sign-in is temporarily unavailable." }, 503);
  if (request.method === "POST" && !sameOrigin(request)) return privateJson({ message: "Access denied." }, 403);
  if (request.method === "POST") {
    try { await readLimitedText(request.clone(), 4096); }
    catch { return privateJson({ message: "Invalid request." }, 413); }
  }
  try {
    const response = await NextAuth(getAuthOptions())(request, context);
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    return response;
  } catch { return privateJson({ message: "Sign-in is temporarily unavailable." }, 503); }
}
export { handler as GET, handler as POST };
