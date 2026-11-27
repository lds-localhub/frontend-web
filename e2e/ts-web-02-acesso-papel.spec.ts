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

    await test.step("iniciar sessão com um e-mail inexistente mostra o erro no formulário", async () => {
      await loginViaUi(page, uniqueEmail("ts02.inexistente"), TEST_PASSWORD);
      const alert = page.getByTestId("form-error");
      await expect(alert).toBeVisible();
      message = await alert.textContent();
    });

    await test.step("a palavra-passe errada mostra a mesma mensagem", async () => {
      await loginViaUi(page, client.email, "Errada2026");
      await expect(page.getByTestId("form-error")).toHaveText(message!);
      await expect(page).toHaveURL(/\/login$/);
    });

    await test.step("o Visitante numa página protegida vai para o início de sessão", async () => {
      await page.goto("/cliente");
      await expect(page).toHaveURL(/\/login$/);
    });

    await test.step("o Cliente numa página de administração vai para o seu início", async () => {
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

    await test.step("o Prestador numa página de Cliente vai para o seu início", async () => {
      const providerPage = await page.context().newPage();
      await openWithSession(providerPage, provider.token);
      await providerPage.goto("/cliente");
      await expect(providerPage).toHaveURL(/\/prestador$/);
      await expect(providerPage.getByRole("link", { name: "Os meus serviços" })).toHaveCount(0);
      await providerPage.close();
    });
  });
});
