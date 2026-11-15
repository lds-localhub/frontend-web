import { createProviderWithProfile } from "./fixtures/providers.ts";
import { expect, test } from "./fixtures/test.ts";

// Teste de sistema de exemplo da pipeline (I093): prova a cadeia completa do ambiente de testes.
// Os dados são preparados pela API (backend + base de dados + stub do Nominatim) e a aplicação
// é aberta no Google Chrome a 1920 × 1080.
test("exemplo: Prestador preparado pela API e aplicação aberta no Google Chrome", async ({
  page,
  request,
}) => {
  await test.step("criar um Prestador com perfil pela API (morada convertida pelo stub)", async () => {
    const provider = await createProviderWithProfile(request, { addressKey: "maia" });
    expect(provider.user.role).toBe("PROVIDER");
    expect(provider.professionalProfileId).toBeGreaterThan(0);
  });

  await test.step("abrir a aplicação a 1920 × 1080", async () => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/pesquisa\/prestadores$/);
    await expect(page.getByRole("heading", { name: "Pesquisar Prestadores" })).toBeVisible();
    expect(page.viewportSize()).toEqual({ width: 1920, height: 1080 });
  });
});
