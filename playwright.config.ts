import { defineConfig } from "@playwright/test";

// Testes de sistema automáticos (QG-06 do regulamento interno)
// Só no Google Chrome, com a viewport 1920 × 1080 (RNF-09, RNF-10)
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "google-chrome",
      use: {
        channel: "chrome",
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],
  // O Vite serve o frontend e reencaminha /api para o backend (BACKEND_URL, por omissão http://localhost:5041)
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
});
