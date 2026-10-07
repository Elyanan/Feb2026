import { requireAdminPage } from "@/lib/auth/session";
import { Registrations } from "@/components/admin/Registrations";
export default async function RegistrationsPage() { await requireAdminPage(); return <Registrations />; }
