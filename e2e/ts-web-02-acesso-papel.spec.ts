import { registerAndLogin, TEST_PASSWORD, uniqueEmail } from "./fixtures/accounts.ts";
import { createProviderWithProfile } from "./fixtures/providers.ts";
import { loginViaUi, openWithSession } from "./fixtures/session.ts";
import { expect, test } from "./fixtures/test.ts";

// TS-WEB-02 — Credenciais erradas e acesso por papel

test.describe("TS-WEB-02 Credenciais erradas e acesso por papel", () => {
  test("credenciais erradas no início de sessão e guardas das páginas por papel", async ({
    page,
    request,
  }) => {
    const client = await registerAndLogin(request, "CLIENT", "ts02.cliente");
    const provider = await createProviderWithProfile(request);
    let message: string | null = null;

    await test.step("1. Iniciar sessão com um e-mail inexistente", async () => {
      await loginViaUi(page, uniqueEmail("ts02.inexistente"), TEST_PASSWORD);
      const alert = page.getByTestId("form-error");
      await expect(alert).toBeVisible();
      message = await alert.textContent();
    });

    await test.step("2. Iniciar sessão com o e-mail do Cliente e a palavra-passe errada", async () => {
      await loginViaUi(page, client.email, "Errada2026");
      await expect(page.getByTestId("form-error")).toHaveText(message!);
      await expect(page).toHaveURL(/\/login$/);
    });

    await test.step("3. Sem sessão, abrir /cliente", async () => {
      await page.goto("/cliente");
      await expect(page).toHaveURL(/\/login$/);
    });

    await test.step("4. Com a sessão do Cliente, abrir /admin", async () => {
      const clientPage = await page.context().newPage();
      await openWithSession(clientPage, client.token);
      await clientPage.goto("/admin");
      await expect(clientPage).toHaveURL(/\/cliente$/);
      await expect(clientPage.getByRole("link", { name: "Contas", exact: true })).toHaveCount(0);
      await expect(clientPage.getByRole("link", { name: "Categorias", exact: true })).toHaveCount(
        0,
      );
      await clientPage.close();
    });

    await test.step("5. Com a sessão do Prestador, abrir /cliente", async () => {
      const providerPage = await page.context().newPage();
      await openWithSession(providerPage, provider.token);
      await providerPage.goto("/cliente");
      await expect(providerPage).toHaveURL(/\/prestador$/);
      await expect(providerPage.getByRole("link", { name: "Os meus serviços" })).toHaveCount(0);
      await providerPage.close();
    });
  });
});
