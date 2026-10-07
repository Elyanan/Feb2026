import { requireAdminPage } from "@/lib/auth/session";
import { Dashboard } from "@/components/admin/Dashboard";
export default async function AdminPage() { await requireAdminPage(); return <Dashboard />; }
