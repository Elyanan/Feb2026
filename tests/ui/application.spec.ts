import { test, expect, type Page } from "@playwright/test";
async function fill(page: Page) {
  await page.goto("/#apply");
  await expect(page.getByLabel("Full name", { exact: true })).toBeEnabled();
  await page.getByLabel("Full name", { exact: true }).fill("Test Student");
  await page.getByLabel("Grade / year").selectOption("Grade 11");
  await page.getByLabel("Email address").fill("test@example.com");
  await page.getByLabel("Phone number").fill("+251911123456");
  await page.getByLabel("Why are you interested in this program?").fill("I want to learn about financial markets and banking.");
  const finance = page.getByRole("radio", { name: "Finance", exact: true });
  await finance.locator("..").click();
  await expect(finance).toBeChecked();
  await page.getByLabel("If you met the corporate banker, what would you ask?").fill("How do you evaluate lending risk?");
}
test.beforeEach(async ({ page }) => {
  await page.route("**/api/registrations", async route => {
    if (route.request().method() === "GET") await route.fulfill({ json: { formToken: "ui-test-token" } });
    else await route.fallback();
  });
});
test("confirmed save animates, locks inputs, and prevents double submit", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  let submissions = 0;
  let finish!: () => void;
  const pending = new Promise<void>(resolve => { finish = resolve; });
  await page.route("**/api/registrations", async route => {
    if (route.request().method() !== "POST") return route.fallback();
    submissions++;
    await pending;
    await route.fulfill({ status: 201, json: { saved: true } });
  });
  await fill(page);
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.getByLabel("Full name", { exact: true })).toBeDisabled();
  await page.locator("form").evaluate(form => { form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
  await expect.poll(() => submissions).toBe(1);
  await expect(page.getByRole("heading", { name: "Application received" })).toHaveCount(0);
  finish();
  await expect(page.getByRole("heading", { name: "Application received" })).toBeVisible();
  await expect(page.getByText("Thank you, Test.")).toBeVisible();
  await expect(page.getByText("You are officially on our list.")).toBeVisible();
  await expect(page.getByText("Thank you, Test.").locator("..")).toHaveCSS("opacity", "1");
  await page.screenshot({ path: testInfo.outputPath("application-success.png") });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
test("server failure preserves answers and permits retry", async ({ page }) => {
  let attempts = 0;
  await page.route("**/api/registrations", async route => {
    if (route.request().method() !== "POST") return route.fallback();
    if (++attempts > 1) return route.fulfill({ status: 201, json: { saved: true } });
    await route.fulfill({ status: 503, json: { code: "unavailable", message: "We couldn't submit your application. Your information is still here. Please try again." } });
  });
  await fill(page);
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.locator("form").getByRole("alert")).toContainText("Your information is still here");
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue("Test Student");
  await expect(page.getByRole("button", { name: "Try again" })).toBeEnabled();
  await expect(page.getByRole("heading", { name: "Application received" })).toHaveCount(0);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("heading", { name: "Application received" })).toBeVisible();
});
test("network failure preserves answers", async ({ page }) => {
  await page.route("**/api/registrations", route => route.request().method() === "POST" ? route.abort("failed") : route.fallback());
  await fill(page);
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.locator("form").getByRole("alert")).toContainText("Your information is still here");
  await expect(page.getByLabel("Email address")).toHaveValue("test@example.com");
});
test("duplicate response never shows success", async ({ page }) => {
  await page.route("**/api/registrations", async route => {
    if (route.request().method() !== "POST") return route.fallback();
    await route.fulfill({ status: 409, json: { code: "duplicate", message: "It looks like an application has already been submitted with this email." } });
  });
  await fill(page);
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.locator("form").getByRole("alert")).toContainText("already been submitted");
  await expect(page.getByRole("heading", { name: "Application received" })).toHaveCount(0);
});
