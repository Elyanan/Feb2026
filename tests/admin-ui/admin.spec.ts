import { test, expect, type Page } from "@playwright/test";
async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Username", { exact: true }).fill("fixture-admin"); await page.getByLabel("Password", { exact: true }).fill("Synthetic password 2026!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click(); await expect(page).toHaveURL(/\/admin$/);
}
test("protects pages and every API while logged out", async ({ page, request }) => {
  await page.goto("/admin"); await expect(page).toHaveURL(/\/admin\/login/);
  for (const path of ["/api/admin/registrations", "/api/admin/stats", "/api/admin/export", `/api/admin/registrations/registration.${"a".repeat(64)}`]) {
    const response = await request.get(path); expect(response.status()).toBe(401); expect(await response.text()).not.toContain("Maya");
  }
  expect((await request.patch(`/api/admin/registrations/registration.${"a".repeat(64)}/status`, { data: { status: "In" } })).status()).toBe(401);
  expect(await page.content()).not.toContain("maya@example.test");
  await request.post("/api/auth/callback/credentials", { headers: { origin: "http://127.0.0.1:3100" }, form: { username: "fixture-admin", password: "Synthetic password 2026!", callbackUrl: "/admin", json: "true" } });
  expect(await (await request.get("/api/auth/session")).json()).toEqual({});
});
test("uses generic login errors and offers password visibility", async ({ page }) => {
  await page.goto("/admin/login"); await page.getByLabel("Username", { exact: true }).fill("wrong"); await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Show password" }).click(); await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Sign in", exact: true }).click(); await expect(page.locator("form").getByRole("alert")).toHaveText("Invalid username or password.");
});
test("registration to authenticated review, persisted status, CSV, and logout", async ({ page }, testInfo) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  const scripts: Promise<string>[] = [];
  page.on("response", response => { if (response.request().resourceType() === "script") scripts.push(response.text().catch(() => "")); });
  const email = `flow-${testInfo.project.name}@example.test`;
  await page.goto("/#apply"); await expect(page.getByLabel("Full name", { exact: true })).toBeEnabled();
  await page.getByLabel("Full name", { exact: true }).fill("Workflow Student"); await page.getByLabel("Grade / year").selectOption("Grade 11"); await page.getByLabel("Email address").fill(email); await page.getByLabel("Phone number").fill("+251911123456"); await page.getByLabel("Why are you interested in this program?").fill("I want to understand capital allocation and learn how banking works."); await page.getByRole("radio", { name: "Finance", exact: true }).locator("..").click(); await page.getByLabel("If you met the corporate banker, what would you ask?").fill("How do you evaluate lending risk?");
  // Exercise the real server completion-time check with a realistic pause.
  await page.waitForTimeout(3200);
  await page.getByRole("button", { name: "Submit application" }).click(); await expect(page.getByRole("heading", { name: "Application received" })).toBeVisible();
  await login(page); await expect(page.getByText("Registration overview")).toBeVisible();
  await expect(page.locator(".admin-metric").first().locator("strong")).not.toHaveText("--");
  await page.screenshot({ path: testInfo.outputPath("dashboard.png") });
  await page.reload(); await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/registrations"); await page.getByRole("searchbox", { name: "Search registrations" }).fill(email);
  await expect(page.locator(".admin-pagination > span")).toHaveText("1-1 of 1");
  const applicant = page.getByRole("button", { name: "Workflow Student", exact: testInfo.project.name === "desktop" }); await expect(applicant).toBeVisible(); await applicant.click();
  const dialog = page.getByRole("dialog", { name: "Workflow Student" }); await expect(dialog).toBeVisible(); await expect(dialog.getByText("How do you evaluate lending risk?", { exact: true })).toBeVisible();
  await dialog.getByLabel("Change status").selectOption("In"); await expect(dialog.getByRole("status")).toContainText("Status updated");
  await page.screenshot({ path: testInfo.outputPath("detail.png") }); await dialog.getByRole("button", { name: "Close application" }).click();
  await page.getByRole("button", { name: "Refresh registrations" }).click(); await applicant.click(); await expect(page.getByRole("dialog").getByLabel("Change status")).toHaveValue("In"); await page.getByRole("button", { name: "Close application" }).click();
  const downloadPromise = page.waitForEvent("download"); await page.getByRole("button", { name: "Export CSV" }).click(); const download = await downloadPromise;
  const stream = await download.createReadStream(); let csv = ""; for await (const chunk of stream!) csv += chunk.toString(); expect(csv).toContain(email); expect(csv).toContain('"In"'); expect(csv).toContain("submittedAt,fullName");
  await page.screenshot({ path: testInfo.outputPath("registrations.png") }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect((await page.request.patch("/api/admin/registrations/not-valid/status", { headers: { origin: "http://127.0.0.1:3100" }, data: { status: "In" } })).status()).toBe(400);
  const listing = await (await page.request.get("/api/admin/registrations")).json(); const id = listing.items.find((item: { email: string }) => item.email === email)._id;
  expect((await page.request.patch(`/api/admin/registrations/${id}/status`, { headers: { origin: "http://127.0.0.1:3100" }, data: { status: "Approved" } })).status()).toBe(400);
  const cookies = await page.context().cookies(); expect(cookies.find(cookie => cookie.name === "feb.session")).toMatchObject({ httpOnly: true, sameSite: "Strict" });
  if (testInfo.project.name === "mobile") await page.getByRole("button", { name: "Open navigation" }).click(); await page.getByRole("button", { name: "Sign out", exact: true }).click(); await expect(page).toHaveURL(/\/admin\/login/);
  expect((await page.request.get("/api/admin/registrations")).status()).toBe(401); await page.goto("/admin"); await expect(page).toHaveURL(/\/admin\/login/); expect(errors).toEqual([]);
  expect((await Promise.all(scripts)).join("\n")).not.toMatch(/fixture-only-token|browser-fixture-auth-secret|Synthetic password 2026!|ADMIN_PASSWORD_HASH|SANITY_API_WRITE_TOKEN/);
});
