import type { ApplicationPayload } from "./site";
export type RegistrationStatus = "Pending" | "In" | "Not in";
export type RegistrationSummary = {
  _id: string; _rev: string; fullName: string; grade: string; email: string; phone: string;
  area: string; status: RegistrationStatus; submittedAt: string;
};
export type RegistrationRecord = RegistrationSummary & ApplicationPayload & {
  source: string; createdAt: string; updatedAt: string; adminNotes?: string;
};
export type RegistrationPage = { items: RegistrationSummary[]; total: number; page: number; pageSize: number };
export type RegistrationStats = {
  total: number; pending: number; accepted: number; declined: number;
  grades: { label: string; count: number }[]; areas: { label: string; count: number }[];
};
