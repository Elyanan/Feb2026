import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/ui", fullyParallel: false,
  use: { baseURL: "http://127.0.0.1:3000", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-reduced", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium", reducedMotion: "reduce" } }
  ],
  webServer: { command: "npm run dev -- --hostname 127.0.0.1", url: "http://127.0.0.1:3000", reuseExistingServer: true, timeout: 120000 }
});
