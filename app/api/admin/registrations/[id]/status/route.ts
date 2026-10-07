import { ZodError } from "zod";
import { adminApiGuard, privateJson, sameOrigin, adminFailure } from "@/lib/admin/http";
import { statusUpdateSchema } from "@/lib/admin/validation";
import { readLimitedJson } from "@/lib/registrations/abuse";
import { RegistrationNotFoundError, updateRegistrationStatus } from "@/lib/sanity/adminRegistrations";
export const dynamic = "force-dynamic";
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await adminApiGuard(); if (denied) return denied;
  if (!sameOrigin(request)) return privateJson({ message: "Access denied." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return privateJson({ message: "Invalid request." }, 400);
  try {
    const { status } = statusUpdateSchema.parse(await readLimitedJson(request));
    const record = await updateRegistrationStatus((await context.params).id, status);
    return privateJson({ status: record.status, updatedAt: record.updatedAt });
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError || error instanceof RangeError) return privateJson({ message: "Invalid registration or status." }, 400);
    if (error instanceof RegistrationNotFoundError) return privateJson({ message: "Registration not found." }, 404);
    if (typeof error === "object" && error !== null && "statusCode" in error && error.statusCode === 409) return privateJson({ message: "This record changed. Refresh and try again." }, 409);
    return adminFailure(error);
  }
}
