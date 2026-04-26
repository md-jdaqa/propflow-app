import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["json", { outputFile: "test-results/results.json" }],
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["list"],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "Desktop Chrome",  use: { ...devices["Desktop Chrome"] } },
    { name: "Mobile iPhone 14", use: { ...devices["iPhone 14"], browserName: "webkit" } },
    { name: "Tablet iPad Pro", use: { ...devices["iPad Pro 11"], browserName: "webkit" } },
  ],
  // Reuse the running dev server on :3000 (Arif keeps it live via Tailscale).
  webServer: {
    command: "echo 'reusing existing dev server on :3000'",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 30_000,
    ignoreHTTPSErrors: true,
  },
});
