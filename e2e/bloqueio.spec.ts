// Teste intencionalmente falhado (I093): evidência de que uma falha nos testes de sistema faz a pipeline
// falhar e bloqueia o merge. Esta branch nunca é integrada na master.

import { test, expect } from "./support/fixtures.ts";

test("teste de exemplo intencionalmente falhado", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Título que não existe" })).toBeVisible({
    timeout: 2000,
  });
});
