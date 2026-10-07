import type { ApplicationPayload } from "@/types/site";

export class ApplicationError extends Error {
  constructor(public code: string, message: string, public errors?: Record<string, string[]>) { super(message); }
}
const failure = "We couldn't submit your application. Your information is still here. Please try again.";
export async function getFormToken(): Promise<string> {
  const response = await fetch("/api/registrations", { cache: "no-store", signal: AbortSignal.timeout(15000) });
  const body = await response.json();
  if (!response.ok || typeof body.formToken !== "string") throw new ApplicationError("unavailable", failure);
  return body.formToken;
}
export async function submitApplication(payload: ApplicationPayload, formToken: string, website: string): Promise<void> {
  const response = await fetch("/api/registrations", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, formToken, website }), signal: AbortSignal.timeout(30000)
  });
  const body = await response.json();
  if (!response.ok) throw new ApplicationError(body.code ?? "unavailable", body.message ?? failure, body.errors);
  if (response.status !== 201 || body.saved !== true) throw new ApplicationError("unavailable", failure);
}
