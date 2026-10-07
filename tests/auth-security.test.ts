import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { hash } from "bcryptjs";
const store = vi.hoisted(() => ({ records: new Map<string, { count: number }>() }));
vi.mock("@/lib/sanity/serverClient", () => ({
  requirePrivateDataset: async () => {},
  getServerClient: () => ({
    createIfNotExists: async (document: { _id: string }) => { if (!store.records.has(document._id)) store.records.set(document._id, { count: 0 }); },
    patch: (id: string) => ({ inc: () => ({ commit: async () => { const record = store.records.get(id)!; return { count: ++record.count }; } }) })
  })
}));
import { loginAttemptAllowed } from "@/lib/auth/throttle";
import { getAuthOptions } from "@/lib/auth/config";
beforeEach(() => { store.records.clear(); vi.stubEnv("AUTH_SECRET", "test-only-auth-security-secret-at-least-32-characters"); });
afterEach(() => vi.unstubAllEnvs());
it("atomically bounds concurrent logins and automatically resets the next bucket", async () => {
  const now = Date.now();
  const attempts = await Promise.all(Array.from({ length: 35 }, () => loginAttemptAllowed(now)));
  expect(attempts.filter(Boolean)).toHaveLength(30); expect(attempts.filter(value => !value)).toHaveLength(5);
  expect(await loginAttemptAllowed(now + 15 * 60 * 1000)).toBe(true);
});
it("rejects expired sessions and invalidates old sessions after password rotation", async () => {
  vi.stubEnv("ADMIN_USERNAME", "fixture-admin"); vi.stubEnv("ADMIN_PASSWORD_HASH", await hash("Synthetic password 2026!", 12));
  const options = getAuthOptions();
  const token = await options.callbacks!.jwt!({ token: { sub: "feb-admin" }, user: { id: "feb-admin", role: "admin" }, account: null, trigger: "signIn", isNewUser: false });
  const session = { expires: "2099-01-01", user: { id: "feb-admin", role: "admin" as const, name: "Administrator" } };
  const user = { id: "feb-admin", email: "", emailVerified: null };
  expect(await options.callbacks!.session!({ session, token, user, newSession: undefined, trigger: "update" })).toMatchObject({ user: { role: "admin" } });
  expect((await options.callbacks!.session!({ session, token: { ...token, absoluteExpiry: Date.now() - 1 }, user, newSession: undefined, trigger: "update" })).user).toBeUndefined();
  vi.stubEnv("ADMIN_PASSWORD_HASH", await hash("Rotated synthetic password!", 12));
  expect((await getAuthOptions().callbacks!.session!({ session, token, user, newSession: undefined, trigger: "update" })).user).toBeUndefined();
  vi.stubEnv("NODE_ENV", "production");
  expect(getAuthOptions().cookies?.sessionToken).toMatchObject({ name: "__Host-feb.session", options: { secure: true, httpOnly: true, sameSite: "strict", path: "/" } });
});
