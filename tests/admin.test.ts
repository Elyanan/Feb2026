import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { hash } from "bcryptjs";
import { evaluate, parse } from "groq-js";
import type { Session } from "next-auth";
const mocks = vi.hoisted(() => ({ session: null as Session | null, fetch: vi.fn(), patch: vi.fn(), datasets: { list: vi.fn() }, config: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ adminSession: async () => mocks.session }));
vi.mock("@sanity/client", () => ({ createClient: () => mocks }));
import { verifyAdminCredentials, getAuthOptions } from "@/lib/auth/config";
import { GET as list } from "@/app/api/admin/registrations/route";
import { GET as detail } from "@/app/api/admin/registrations/[id]/route";
import { GET as stats } from "@/app/api/admin/stats/route";
import { GET as exportCSV } from "@/app/api/admin/export/route";
import { PATCH } from "@/app/api/admin/registrations/[id]/status/route";
import { getRegistrationStats, getRegistrations } from "@/lib/sanity/adminRegistrations";
import { csvCell } from "@/lib/admin/csv";

const id = `registration.${"a".repeat(64)}`;
const context = { params: Promise.resolve({ id }) };
const admin = { user: { id: "feb-admin", role: "admin" as const, name: "Administrator" }, expires: "2099-01-01" };
beforeEach(() => {
  mocks.session = null;
  vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "testproject"); vi.stubEnv("NEXT_PUBLIC_SANITY_DATASET", "registrations"); vi.stubEnv("NEXT_PUBLIC_SANITY_API_VERSION", "2026-10-07"); vi.stubEnv("SANITY_API_WRITE_TOKEN", "test-only-token"); vi.stubEnv("AUTH_SECRET", "test-auth-secret-with-at-least-thirty-two-characters");
  mocks.datasets.list.mockResolvedValue([{ name: "registrations", aclMode: "private" }]); mocks.config.mockReturnValue({ dataset: "registrations" });
});
afterEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); });
function update(body: object, target = id, origin = "http://localhost:3000") {
  return PATCH(new Request("http://localhost:3000/api/admin/registrations/status", { method: "PATCH", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(body) }), { params: Promise.resolve({ id: target }) });
}
describe("admin API security", () => {
  it("denies all read/export/write endpoints before querying Sanity", async () => {
    const responses = await Promise.all([list(new Request("http://localhost:3000/api/admin/registrations")), detail(new Request("http://localhost:3000"), context), stats(), exportCSV(new Request("http://localhost:3000/api/admin/export")), update({ status: "In" })]);
    expect(responses.map(response => response.status)).toEqual([401, 401, 401, 401, 401]); expect(mocks.fetch).not.toHaveBeenCalled(); expect(mocks.patch).not.toHaveBeenCalled();
  });
  it("rejects a session without admin identity", async () => {
    mocks.session = { ...admin, user: { ...admin.user, id: "other" } };
    expect((await stats()).status).toBe(403); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it.each([{ status: "Approved" }, { status: "In", _type: "other" }])("rejects forbidden status bodies %j", async body => {
    mocks.session = admin; expect((await update(body)).status).toBe(400); expect(mocks.patch).not.toHaveBeenCalled();
  });
  it("rejects arbitrary document IDs", async () => { mocks.session = admin; expect((await update({ status: "In" }, "other-document")).status).toBe(400); expect(mocks.patch).not.toHaveBeenCalled(); });
  it("rejects cross-origin writes", async () => { mocks.session = admin; expect((await update({ status: "In" }, id, "https://evil.test")).status).toBe(403); });
  it("rejects a matching ID with a different document type", async () => {
    mocks.session = admin; mocks.fetch.mockResolvedValue({ _type: "other", _rev: "v1" }); expect((await update({ status: "In" })).status).toBe(404); expect(mocks.patch).not.toHaveBeenCalled();
  });
  it("uses revision-guarded updates and returns only status metadata", async () => {
    mocks.session = admin; mocks.fetch.mockResolvedValue({ _type: "registration", _rev: "v1" });
    const commit = vi.fn().mockResolvedValue({ status: "In", updatedAt: "today", email: "private@test.test" });
    const set = vi.fn().mockReturnValue({ commit }); const ifRevisionId = vi.fn().mockReturnValue({ set }); mocks.patch.mockReturnValue({ ifRevisionId });
    const response = await update({ status: "In" }); expect(response.status).toBe(200); expect(ifRevisionId).toHaveBeenCalledWith("v1"); expect(await response.json()).toEqual({ status: "In", updatedAt: "today" }); expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it("sanitizes upstream failures", async () => { mocks.session = admin; mocks.fetch.mockRejectedValue(new Error("token SECRET query")); const response = await stats(); expect(response.status).toBe(500); expect(await response.text()).not.toMatch(/SECRET|token|query/); });
  it("rejects invalid filters", async () => { mocks.session = admin; expect((await list(new Request("http://localhost:3000/api/admin/registrations?status=bad"))).status).toBe(400); });
});
describe("real GROQ query behavior", () => {
  const dataset = [
    { _id: id, _type: "registration", fullName: "Test Student", email: "test@test.test", phone: "0911234567", grade: "Grade 11", area: "Finance", motivation: "Learning capital allocation", speakerQuestion: "How do loans work?", submittedAt: "2026-10-07", status: "Pending" },
    { _id: `registration.${"b".repeat(64)}`, _type: "registration", fullName: "Another Student", grade: "Grade 10", area: "Business", submittedAt: "2026-10-06", status: "In" }
  ];
  beforeEach(() => { mocks.fetch.mockImplementation(async (query: string, params: Record<string, unknown>) => (await evaluate(parse(query), { dataset, params })).get()); });
  it("returns actual counts and distributions", async () => {
    const result = await getRegistrationStats(); expect(result).toMatchObject({ total: 2, pending: 1, accepted: 1, declined: 0 }); expect(result.grades.find(item => item.label === "Grade 11")?.count).toBe(1); expect(result.areas.find(item => item.label === "Finance")?.count).toBe(1);
  });
  it.each(["Student", "test@test.test", "0911234567", "Grade 11", "Finance", "capital", "loans"])("searches %s", async search => { expect((await getRegistrations({ search })).items.some(item => item._id === id)).toBe(true); });
  it("filters and paginates without returning long answers", async () => {
    const result = await getRegistrations({ status: "Pending", grade: "Grade 11", area: "Finance", pageSize: 1 }); expect(result.total).toBe(1); expect(result.items).toHaveLength(1); expect(result.items[0]).not.toHaveProperty("motivation");
  });
});
describe("password verification and export", () => {
  it("verifies bcrypt and rejects wrong usernames/passwords", async () => {
    vi.stubEnv("ADMIN_USERNAME", "fixture-admin"); vi.stubEnv("ADMIN_PASSWORD_HASH", await hash("Synthetic password 2026!", 12));
    expect(await verifyAdminCredentials("fixture-admin", "Synthetic password 2026!")).toBe(true); expect(await verifyAdminCredentials("wrong", "Synthetic password 2026!")).toBe(false); expect(await verifyAdminCredentials("fixture-admin", "wrong")).toBe(false);
    const options = getAuthOptions(); expect(options.session?.maxAge).toBe(28800); expect(options.cookies?.sessionToken?.options).toMatchObject({ httpOnly: true, sameSite: "strict" });
  });
  it.each(["=SUM(A1)", "+251911123456", "-1+2", "@formula", " \t=1", "\nformula"])("defuses CSV formulas %j", value => expect(csvCell(value)).toMatch(/^"'/));
  it("escapes commas, quotes, and line breaks", () => expect(csvCell('a,"b"\nc')).toBe('"a,""b""\nc"'));
});
