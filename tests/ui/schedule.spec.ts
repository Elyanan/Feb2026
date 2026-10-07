import { expect, test } from "@playwright/test";

test("shows confirmed Thursday dates, Lunch Time, and an undated fourth session", async ({ page }, testInfo) => {
  await page.goto("/");
  const dates = page.getByText("Oct 15, 22 & 29, 2026", { exact: true });
  await expect(dates).toBeVisible();
  await expect(page.getByText("Lunch Time", { exact: true })).toBeVisible();
  const section = page.locator("#schedule");
  const confirmed = ["2026-10-15", "2026-10-22", "2026-10-29"];
  for (const [index, date] of confirmed.entries()) {
    expect(new Date(`${date}T00:00:00Z`).getUTCDay()).toBe(4);
    const time = section.locator("time").nth(index);
    await expect(time).toHaveAttribute("datetime", date);
    await expect(time).toHaveText(`Thursday, Oct ${15 + index * 7}`);
  }
  await expect(section.locator("time")).toHaveCount(3);
  const fourth = section.getByRole("button", { name: /Session 04/ });
  await expect(fourth).toContainText("Date TBD");
  await fourth.click();
  await expect(section.getByText("Guest speaker session", { exact: true })).toBeVisible();
  await expect(section.getByText("Final discussion", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await section.screenshot({ path: testInfo.outputPath("schedule.png") });
  await dates.scrollIntoViewIfNeeded();
  await dates.locator("..").screenshot({ path: testInfo.outputPath("dates.png") });
});
