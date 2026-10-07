import { ZodError } from "zod";
import { adminApiGuard, privateJson, adminFailure } from "@/lib/admin/http";
import { parseFilters } from "@/lib/admin/validation";
import { getRegistrations } from "@/lib/sanity/adminRegistrations";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const denied = await adminApiGuard(); if (denied) return denied;
  try { return privateJson(await getRegistrations(parseFilters(request.url))); }
  catch (error) { return error instanceof ZodError ? privateJson({ message: "Invalid filters." }, 400) : adminFailure(error); }
}
