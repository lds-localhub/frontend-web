import { defineConfig, devices } from "@playwright/test";

// Testes de sistema automáticos (QG-06 do regulamento interno), contra o backend real.
// Ambiente: Google Chrome (RNF-10) com viewport de 1920 × 1080 px (RNF-09). Ver o README, secção
// "Testes de sistema", para o arranque local do backend, da base de dados e do geocodificador simulado.
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/support/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["github"], ["list"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  // Mostrado no relatório HTML (versão do backend e commit testados)
  metadata: {
    backend: process.env.BACKEND_REF ?? "local",
    commit: process.env.GITHUB_SHA ?? "local",
  },
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "google-chrome",
      use: {
        ...devices["Desktop Chrome"],
        // Google Chrome instalado no sistema, e não o Chromium do Playwright
        channel: "chrome",
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
});
