import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  outputDir: "./test-results/admin",
  testDir: "./tests/admin-ui", workers: 1, timeout: 90000,
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure", actionTimeout: 15000 },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } }, { name: "mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium", reducedMotion: "reduce" } }],
  webServer: { command: "node scripts/test-admin-server.mjs", url: "http://127.0.0.1:3100/admin/login", reuseExistingServer: false, timeout: 120000 }
});
