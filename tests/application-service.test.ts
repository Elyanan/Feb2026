import { afterEach, expect, it, vi } from "vitest";
import { submitApplication } from "@/lib/application-service";
const values = { fullName: "Test Student", grade: "Grade 11", email: "test@example.com", phone: "123456789", motivation: "A sufficiently long answer here.", area: "Finance", speakerQuestion: "A sufficiently long question?" };
afterEach(() => vi.unstubAllGlobals());
it("rejects network failures", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Network failed")));
  await expect(submitApplication(values, "token", "")).rejects.toThrow();
});
it.each([{ saved: false }, { saved: true }])("rejects unconfirmed 200 responses %j", async body => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(body)));
  await expect(submitApplication(values, "token", "")).rejects.toThrow();
});
it("accepts only confirmed 201 saves", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ saved: true }, { status: 201 })));
  await expect(submitApplication(values, "token", "")).resolves.toBeUndefined();
});
