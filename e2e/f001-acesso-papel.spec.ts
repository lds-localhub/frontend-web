import { registerAndLogin, TEST_PASSWORD, uniqueEmail } from "./fixtures/accounts.ts";
import { ADMIN_EMAIL, adminPassword, deactivateAccount, loginAsAdmin } from "./fixtures/admin.ts";
import { loginViaUi, openWithSession } from "./fixtures/session.ts";
import { expect, test } from "./fixtures/test.ts";

// TS-WEB-02 — Credenciais inválidas e acesso por papel (RF-F001-03, com as regras do RF-F001-02)

test.describe("TS-WEB-02 Credenciais inválidas e acesso por papel", () => {
  test("e-mail inexistente e palavra-passe errada mostram a mesma mensagem", async ({
    page,
    request,
  }) => {
    const account = await registerAndLogin(request, "CLIENT", "ts02.credenciais");

    await loginViaUi(page, uniqueEmail("ts02.inexistente"), TEST_PASSWORD);
    const unknownEmail = page.getByRole("alert");
    await expect(unknownEmail).toBeVisible();
    const message = await unknownEmail.textContent();

    await loginViaUi(page, account.email, "Errada2026");
    await expect(page.getByRole("alert")).toHaveText(message!);
    await expect(page).toHaveURL(/\/login$/);
  });

  test("uma conta desativada mostra a mensagem própria e não inicia sessão", async ({
    page,
    request,
  }) => {
    const account = await registerAndLogin(request, "CLIENT", "ts02.desativada");
    await deactivateAccount(request, await loginAsAdmin(request), account.user.userId);

    await loginViaUi(page, account.email, account.password);
    await expect(page.getByRole("alert")).toContainText("A sua conta foi desativada.");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("«Esqueci-me da palavra-passe» mostra o contacto de suporte sem pedidos ao backend", async ({
    page,
  }) => {
    await page.goto("/login");
    const apiRequests: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/api/")) {
        apiRequests.push(r.url());
      }
    });

    await page.getByRole("button", { name: "Esqueci-me da palavra-passe" }).click();
    await expect(
      page.getByText(
        /Para recuperar o acesso, contacte suporte@localhub\.test a partir do endereço de e-mail registado na conta\./,
      ),
    ).toBeVisible();
    expect(apiRequests).toEqual([]);
  });

  test("o Cliente só acede às suas páginas e não vê a administração", async ({ page, request }) => {
    const client = await registerAndLogin(request, "CLIENT", "ts02.cliente");
    await openWithSession(page, client.token);

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/cliente$/);
    await expect(page.getByRole("link", { name: "Os meus serviços" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Contas" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Categorias" })).toHaveCount(0);

    await page.goto("/prestador");
    await expect(page).toHaveURL(/\/cliente$/);
  });

  test("o Administrador acede à área de administração", async ({ page }) => {
    await loginViaUi(page, ADMIN_EMAIL, adminPassword());
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("link", { name: "Contas" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Categorias" })).toBeVisible();

    await page.goto("/cliente");
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/pesquisa/prestadores");
    await expect(page).toHaveURL(/\/admin$/);
  });

  test("o Prestador sem perfil é encaminhado para a página de criação do perfil", async ({
    page,
    request,
  }) => {
    const provider = await registerAndLogin(request, "PROVIDER", "ts02.semperfil");
    await openWithSession(page, provider.token);

    await page.goto("/prestador");
    await expect(page).toHaveURL(/\/perfil\/criar$/);
    await expect(page.getByRole("link", { name: "Solicitações recebidas" })).toHaveCount(0);

    await page.goto("/conta/palavra-passe");
    await expect(page.getByRole("heading", { name: "Alterar palavra-passe" })).toBeVisible();
  });

  test("sem sessão, uma página protegida leva ao início de sessão", async ({ page }) => {
    await page.goto("/cliente");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("uma sessão que já não é válida leva ao início de sessão com a indicação", async ({
    page,
  }) => {
    // Token guardado uma só vez: o api() apaga-o ao receber o 401 e recarrega no início de sessão
    await page.goto("/login");
    await page.evaluate(`localStorage.setItem("token", "token-invalido")`);
    await page.goto("/cliente");
    await expect(page).toHaveURL(/\/login\?sessao=terminada$/);
    await expect(page.getByText("A sua sessão terminou. Inicie sessão novamente.")).toBeVisible();
  });
});
