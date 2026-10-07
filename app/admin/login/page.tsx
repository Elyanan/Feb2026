import { redirect } from "next/navigation";
import { adminSession } from "@/lib/auth/session";
import { LoginForm } from "@/components/admin/LoginForm";
import { authConfigured } from "@/lib/auth/config";
export default async function LoginPage() {
  if ((await adminSession())?.user?.role === "admin") redirect("/admin");
  return <LoginForm configured={authConfigured()} />;
}
