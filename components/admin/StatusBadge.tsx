import type { RegistrationStatus } from "@/types/registration";
export function StatusBadge({ status }: { status: RegistrationStatus }) { return <span className={`admin-badge ${status === "In" ? "in" : status === "Not in" ? "out" : "pending"}`}>{status}</span>; }
