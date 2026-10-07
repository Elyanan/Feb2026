import { adminApiGuard, privateJson, adminFailure } from "@/lib/admin/http";
import { getRegistrationStats } from "@/lib/sanity/adminRegistrations";
export const dynamic = "force-dynamic";
export async function GET() {
  const denied = await adminApiGuard(); if (denied) return denied;
  try { return privateJson(await getRegistrationStats()); } catch { return adminFailure(); }
}
