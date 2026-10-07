import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({
  datasets: { list: vi.fn() }, config: vi.fn(), fetch: vi.fn(), create: vi.fn()
}));
vi.mock("@sanity/client", () => ({ createClient: () => mock }));
import { GET, POST } from "@/app/api/registrations/route";
import { applicationSchema } from "@/lib/validation/application";
import { issueFormToken, validFormToken, allowAttempt } from "@/lib/registrations/abuse";
import { registrationId } from "@/lib/sanity/registrations";

const values = { fullName: "Test Student", grade: "Grade 11", email: "test@example.com", phone: "+251911123456", motivation: "I want to learn how finance and banking work.", area: "Finance", speakerQuestion: "How do you evaluate lending risk?" };
function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost:3000/api/registrations", { method: "POST", headers: { origin: "http://localhost:3000", "content-type": "application/json", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });
}
function payload(extra: object = {}) { return { ...values, website: "", formToken: issueFormToken(Date.now() - 4000), ...extra }; }
beforeEach(() => {
  vi.stubEnv("REGISTRATION_FORM_SECRET", "test-only-secret-with-at-least-32-characters");
  vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "testproject");
  vi.stubEnv("NEXT_PUBLIC_SANITY_DATASET", "registrations");
  vi.stubEnv("NEXT_PUBLIC_SANITY_API_VERSION", "2026-10-07");
  vi.stubEnv("SANITY_API_WRITE_TOKEN", "test-only-token");
  mock.config.mockReturnValue({ dataset: "registrations" });
  mock.datasets.list.mockResolvedValue([{ name: "registrations", aclMode: "private" }]);
  mock.fetch.mockResolvedValue(false);
  mock.create.mockImplementation(async document => document);
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { vi.restoreAllMocks(); vi.clearAllMocks(); vi.unstubAllEnvs(); });
describe("registration API", () => {
  it("confirms a real storage response, normalizes email, strips privileged fields", async () => {
    const response = await POST(request(payload({ email: "  TEST@EXAMPLE.COM  ", status: "In", source: "evil", _id: "other", adminNotes: "bad", submittedAt: "bad" })));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ saved: true });
    const [record] = mock.create.mock.calls[0];
    expect(record).toMatchObject({ email: values.email, status: "Pending", source: "feb-website", _id: registrationId(values.email) });
    expect(record).not.toHaveProperty("adminNotes");
    expect(record).not.toHaveProperty("website");
    expect(record.submittedAt).not.toBe("bad");
  });
  it.each([
    { email: "not-email" }, { fullName: " " }, { grade: "Graduate" }, { motivation: "short" },
    { area: "" }, { area: "bad" }, { speakerQuestion: "short" }, { phone: "123" },
    { motivation: "x".repeat(3001) }, { speakerQuestion: "x".repeat(1501) }
  ])("rejects invalid fields %j", async fields => {
    expect((await POST(request(payload(fields)))).status).toBe(422);
    expect(mock.create).not.toHaveBeenCalled();
  });
  it("rejects all empty required values", async () => {
    const response = await POST(request(payload(Object.fromEntries(Object.keys(values).map(key => [key, ""])) )));
    expect(response.status).toBe(422);
  });
  it("reports a duplicate email without creating", async () => {
    mock.fetch.mockResolvedValue(true);
    const response = await POST(request(payload()));
    expect(response.status).toBe(409);
    expect((await response.json()).code).toBe("duplicate");
    expect(mock.create).not.toHaveBeenCalled();
  });
  it("uses atomic creation for simultaneous identical emails", async () => {
    const ids = new Set<string>();
    mock.create.mockImplementation(async document => {
      if (ids.has(document._id)) throw { statusCode: 409 };
      ids.add(document._id);
      return document;
    });
    const responses = await Promise.all([POST(request(payload())), POST(request(payload()))]);
    expect(responses.map(response => response.status).sort()).toEqual([201, 409]);
    expect(ids.size).toBe(1);
  });
  it.each(["public", "custom"])("never writes to a %s dataset", async aclMode => {
    mock.datasets.list.mockResolvedValue([{ name: "registrations", aclMode }]);
    expect((await POST(request(payload()))).status).toBe(503);
    expect(mock.create).not.toHaveBeenCalled();
  });
  it("fails closed when dataset visibility cannot be checked", async () => {
    mock.datasets.list.mockRejectedValue(new Error("private diagnostic"));
    expect((await POST(request(payload()))).status).toBe(503);
    expect(mock.create).not.toHaveBeenCalled();
  });
  it("sanitizes upstream failure and never signals success", async () => {
    mock.create.mockRejectedValue(new Error("Sanity token or internal diagnostic"));
    const response = await POST(request(payload()));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toMatch(/token|diagnostic|saved/);
  });
  it("rejects missing storage confirmation", async () => {
    mock.create.mockResolvedValue({});
    expect((await POST(request(payload()))).status).toBe(503);
  });
  it("rejects malformed JSON", async () => { expect((await POST(request("{"))).status).toBe(400); });
  it("enforces streamed size limits without content-length", async () => { expect((await POST(request("x".repeat(17000)))).status).toBe(413); });
  it("rejects oversized declared payloads", async () => { expect((await POST(request(payload(), { "content-length": "17000" }))).status).toBe(413); });
  it("rejects cross-origin and absent origin", async () => {
    expect((await POST(request(payload(), { origin: "https://other.test" }))).status).toBe(403);
    const req = request(payload()); req.headers.delete("origin");
    expect((await POST(req)).status).toBe(403);
  });
  it("rejects unsupported content types", async () => { expect((await POST(request(payload(), { "content-type": "text/plain" }))).status).toBe(415); });
  it("rejects the honeypot without saving", async () => {
    expect((await POST(request(payload({ website: "bot" })))).status).toBe(400);
    expect(mock.create).not.toHaveBeenCalled();
  });
  it("rejects fast and forged timing tokens", async () => {
    expect((await POST(request(payload({ formToken: issueFormToken() })))).status).toBe(400);
    expect((await POST(request(payload({ formToken: "forged" })))).status).toBe(400);
  });
  it("only exposes a form challenge on GET", async () => {
    const response = await GET();
    expect(Object.keys(await response.json())).toEqual(["formToken"]);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
describe("abuse and validation", () => {
  it("enforces signature, minimum time, and expiry on server", () => {
    const now = Date.now(); const token = issueFormToken(now);
    expect(validFormToken(token, now + 3000)).toBe(true);
    expect(validFormToken(token, now + 2999)).toBe(false);
    expect(validFormToken(token, now - 1)).toBe(false);
    expect(validFormToken(token, now + 7200001)).toBe(false);
    expect(validFormToken(token.slice(0, -1) + (token.endsWith("0") ? "1" : "0"), now + 4000)).toBe(false);
  });
  it("bounds retries", () => {
    const token = issueFormToken();
    for (let i = 0; i < 5; i++) expect(allowAttempt(token)).toBe(true);
    expect(allowAttempt(token)).toBe(false);
    expect(allowAttempt(token, Date.now() + 60001)).toBe(true);
  });
  it("shares normalization and trims application text", () => {
    expect(applicationSchema.parse({ ...values, fullName: " Test Student ", email: " TEST@EXAMPLE.COM " })).toMatchObject({ fullName: values.fullName, email: values.email });
  });
});
