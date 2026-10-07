import "server-only";
import { adminSession } from "@/lib/auth/session";
import { developmentError } from "@/lib/diagnostics";
export function privateJson(body: object, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store, max-age=0", "Vary": "Cookie" } });
}
export async function adminApiGuard() {
  const session = await adminSession();
  if (!session?.user) return privateJson({ message: "Please sign in." }, 401);
  if (session.user.role !== "admin" || session.user.id !== "feb-admin") return privateJson({ message: "Access denied." }, 403);
  return null;
}
export { sameOrigin } from "@/lib/security/origin";
export function adminFailure(error?: unknown) {
  developmentError("admin", "DATA_REQUEST_FAILED", error);
  return privateJson({ message: "We couldn't complete this request. Please try again." }, 500);
}
