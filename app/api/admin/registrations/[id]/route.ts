import { ZodError } from "zod";
import { adminApiGuard, privateJson, adminFailure } from "@/lib/admin/http";
import { getRegistrationById } from "@/lib/sanity/adminRegistrations";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await adminApiGuard(); if (denied) return denied;
  try {
    const record = await getRegistrationById((await context.params).id);
    return record ? privateJson(record) : privateJson({ message: "Registration not found." }, 404);
  } catch (error) { return error instanceof ZodError ? privateJson({ message: "Invalid registration." }, 400) : adminFailure(); }
}
