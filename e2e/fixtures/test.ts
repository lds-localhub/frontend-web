import { test as base, expect } from "@playwright/test";

// Todos os testes de sistema importam o test e o expect daqui, e não de @playwright/test.
// A fixture automática regista em cada teste a versão do Google Chrome usada (RNF-10),
// que aparece no relatório HTML do Playwright.
export const test = base.extend<{ chromeVersion: void }>({
  chromeVersion: [
    async ({ browser }, run, testInfo) => {
      testInfo.annotations.push({ type: "Google Chrome", description: browser.version() });
      await run();
    },
    { auto: true },
  ],
});

export { expect };
