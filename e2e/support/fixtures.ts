// Fixtures partilhadas pelos testes de sistema. Os testes importam test e expect daqui, e não diretamente
// do @playwright/test.

import { test as base, type APIRequestContext } from "@playwright/test";
import { BACKEND_URL } from "./api.ts";

interface Fixtures {
  // Cliente HTTP para o backend real, usado pelos helpers de preparação dos dados (api.ts)
  api: APIRequestContext;
  // Regista o navegador e a versão em cada teste do relatório (QG-06, RNF-10)
  versaoNavegador: void;
}

export const test = base.extend<Fixtures>({
  api: async ({ playwright }, usar) => {
    const api = await playwright.request.newContext({ baseURL: BACKEND_URL });
    await usar(api);
    await api.dispose();
  },

  versaoNavegador: [
    async ({ browser }, usar, testInfo) => {
      const canal = testInfo.project.use.channel;
      const nome = canal === "chrome" ? "Google Chrome" : (canal ?? browser.browserType().name());
      testInfo.annotations.push({ type: "Navegador", description: `${nome} ${browser.version()}` });
      await usar();
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
