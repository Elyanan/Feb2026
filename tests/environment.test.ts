import { afterEach, expect, it, vi } from "vitest";
import { hash } from "bcryptjs";
import { ConfigurationError, getAuthEnvironment, getRegistrationSecret, getSanityEnvironment } from "@/lib/env";
import { developmentError } from "@/lib/diagnostics";
import { GET } from "@/app/api/registrations/route";
import { sameOrigin } from "@/lib/security/origin";

afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });
it("reports a missing form secret without exposing it to the browser", async () => {
  vi.stubEnv("REGISTRATION_FORM_SECRET", ""); vi.stubEnv("NODE_ENV", "development");
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  const response = await GET();
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("REGISTRATION_FORM_SECRET");
  expect(log.mock.calls.flat().join(" ")).toContain("REGISTRATION_FORM_SECRET");
});
it("validates registration signing independently of admin configuration", () => {
  vi.stubEnv("ADMIN_USERNAME", ""); vi.stubEnv("AUTH_SECRET", "");
  vi.stubEnv("REGISTRATION_FORM_SECRET", "synthetic-form-secret-at-least-32-characters");
  expect(getRegistrationSecret()).toBe("synthetic-form-secret-at-least-32-characters");
});
it("validates Sanity independently of admin configuration", () => {
  vi.stubEnv("ADMIN_PASSWORD_HASH", ""); vi.stubEnv("AUTH_SECRET", "");
  vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "testproject"); vi.stubEnv("NEXT_PUBLIC_SANITY_DATASET", "registrations");
  vi.stubEnv("NEXT_PUBLIC_SANITY_API_VERSION", "2026-10-07"); vi.stubEnv("SANITY_API_WRITE_TOKEN", "synthetic-server-token");
  expect(getSanityEnvironment().NEXT_PUBLIC_SANITY_DATASET).toBe("registrations");
});
it("names all invalid authentication settings, without including their values", () => {
  vi.stubEnv("ADMIN_USERNAME", ""); vi.stubEnv("ADMIN_PASSWORD_HASH", "plaintext-sensitive-value"); vi.stubEnv("AUTH_SECRET", "short-sensitive-secret");
  try { getAuthEnvironment(); throw new Error("Expected configuration rejection"); }
  catch (error) {
    expect(error).toBeInstanceOf(ConfigurationError);
    const message = (error as ConfigurationError).message;
    expect(message).toContain("ADMIN_USERNAME"); expect(message).toContain("ADMIN_PASSWORD_HASH"); expect(message).toContain("AUTH_SECRET");
    expect(message).not.toMatch(/plaintext-sensitive-value|short-sensitive-secret/);
  }
});
it("accepts a genuine cost-12 bcrypt hash", async () => {
  vi.stubEnv("ADMIN_USERNAME", "test-admin"); vi.stubEnv("ADMIN_PASSWORD_HASH", await hash("synthetic-password-not-for-production", 12));
  vi.stubEnv("AUTH_SECRET", "synthetic-auth-secret-at-least-32-characters");
  expect(getAuthEnvironment().ADMIN_USERNAME).toBe("test-admin");
});
it("reports SDK status but never dumps sensitive exceptions", () => {
  vi.stubEnv("NODE_ENV", "development"); const log = vi.spyOn(console, "error").mockImplementation(() => {});
  developmentError("registration", "SUBMISSION_FAILED", Object.assign(new Error("token-and-applicant-pii"), { statusCode: 401, request: { token: "sensitive-token" } }));
  expect(log).toHaveBeenCalledWith("[registration] SUBMISSION_FAILED", { kind: "Error", status: 401 });
  expect(JSON.stringify(log.mock.calls)).not.toMatch(/sensitive-token|token-and-applicant-pii/);
});
it("keeps diagnostics silent in production", () => {
  vi.stubEnv("NODE_ENV", "production"); const log = vi.spyOn(console, "error").mockImplementation(() => {});
  developmentError("auth", "CONFIGURATION_INCOMPLETE", new ConfigurationError(["AUTH_SECRET missing"]));
  expect(log).not.toHaveBeenCalled();
});
it("fails closed rather than throwing for an invalid configured origin", () => {
  vi.stubEnv("NEXTAUTH_URL", "not-a-url");
  expect(sameOrigin(new Request("http://127.0.0.1:3000/api/registrations", { headers: { origin: "http://127.0.0.1:3000" } }))).toBe(false);
});
