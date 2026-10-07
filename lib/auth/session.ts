import "server-only";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfigured, getAuthOptions } from "./config";
import { developmentError } from "@/lib/diagnostics";

export async function adminSession() {
  if (!authConfigured()) return null;
  try { return await getServerSession(getAuthOptions()); }
  catch (error) { developmentError("auth", "SESSION_FAILED", error); return null; }
}
export async function requireAdminPage() {
  const session = await adminSession();
  if (!session?.user || session.user.role !== "admin" || session.user.id !== "feb-admin") redirect("/admin/login");
  return session.user;
}
