import { ZodError } from "zod";
import { adminApiGuard, privateJson, adminFailure, sameOrigin } from "@/lib/admin/http";
import { deleteRegistration, getRegistrationById, RegistrationNotFoundError } from "@/lib/sanity/adminRegistrations";
import { developmentError, developmentInfo } from "@/lib/diagnostics";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await adminApiGuard(); if (denied) return denied;
  try {
    const record = await getRegistrationById((await context.params).id);
    return record ? privateJson(record) : privateJson({ message: "Registration not found." }, 404);
  } catch (error) { return error instanceof ZodError ? privateJson({ message: "Invalid registration." }, 400) : adminFailure(error); }
}
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await adminApiGuard();
  if (denied) return privateJson({ ok: false, error: denied.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN" }, denied.status);
  if (!sameOrigin(request)) return privateJson({ ok: false, error: "FORBIDDEN" }, 403);
  try {
    await deleteRegistration((await context.params).id);
    developmentInfo("admin", "registration deleted");
    return privateJson({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) return privateJson({ ok: false, error: "INVALID_REGISTRATION" }, 400);
    if (error instanceof RegistrationNotFoundError) return privateJson({ ok: false, error: "NOT_FOUND" }, 404);
    developmentError("admin", "DELETE_FAILED", error);
    const conflict = typeof error === "object" && error !== null && "statusCode" in error && error.statusCode === 409;
    return privateJson({ ok: false, error: "DELETE_FAILED", message: "Could not delete this registration. Please try again." }, conflict ? 409 : 500);
  }
}
