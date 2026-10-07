import { requireAdminPage } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/AdminShell";
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return <AdminShell>{children}</AdminShell>;
}
