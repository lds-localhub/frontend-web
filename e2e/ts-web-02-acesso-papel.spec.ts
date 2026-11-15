import { registerAndLogin, TEST_PASSWORD, uniqueEmail } from "./fixtures/accounts.ts";
import { ADMIN_EMAIL, adminPassword, deactivateAccount, loginAsAdmin } from "./fixtures/admin.ts";
import { createProviderWithProfile } from "./fixtures/providers.ts";
import { loginViaUi, openWithSession } from "./fixtures/session.ts";
import { expect, test } from "./fixtures/test.ts";

// TS-WEB-02 — Credenciais inválidas e acesso por papel (RF-F001-03, com as regras do RF-F001-02)

test.describe("TS-WEB-02 Credenciais inválidas e acesso por papel", () => {
  test("e-mail inexistente e palavra-passe errada mostram a mesma mensagem", async ({
    page,
    request,
  }) => {
    const account = await registerAndLogin(request, "CLIENT", "ts02.credenciais");
    let message: string | null = null;

    await test.step("iniciar sessão com um e-mail inexistente", async () => {
      await loginViaUi(page, uniqueEmail("ts02.inexistente"), TEST_PASSWORD);
      const alert = page.getByRole("alert");
      await expect(alert).toBeVisible();
      message = await alert.textContent();
    });

    await test.step("iniciar sessão com a palavra-passe errada mostra a mesma mensagem", async () => {
      await loginViaUi(page, account.email, "Errada2026");
      await expect(page.getByRole("alert")).toHaveText(message!);
      await expect(page).toHaveURL(/\/login$/);
    });
  });

  test("uma conta desativada mostra a mensagem própria e não inicia sessão", async ({
    page,
    request,
  }) => {
    const account = await registerAndLogin(request, "CLIENT", "ts02.desativada");

    await test.step("o Administrador desativa a conta (pela API)", async () => {
      await deactivateAccount(request, await loginAsAdmin(request), account.user.userId);
    });

    await test.step("iniciar sessão mostra a indicação de conta desativada", async () => {
      await loginViaUi(page, account.email, account.password);
      await expect(page.getByRole("alert")).toContainText("A sua conta foi desativada.");
      await expect(page).toHaveURL(/\/login$/);
    });
  });

  test("«Esqueci-me da palavra-passe» mostra o contacto de suporte sem pedidos ao backend", async ({
    page,
  }) => {
    const apiRequests: string[] = [];

    await test.step("abrir o início de sessão e registar os pedidos ao backend", async () => {
      await page.goto("/login");
      page.on("request", (r) => {
        if (r.url().includes("/api/")) {
          apiRequests.push(r.url());
        }
      });
    });

    await test.step("selecionar «Esqueci-me da palavra-passe»", async () => {
      await page.getByRole("button", { name: "Esqueci-me da palavra-passe" }).click();
      await expect(
        page.getByText(
          /Para recuperar o acesso, contacte suporte@localhub\.test a partir do endereço de e-mail registado na conta\./,
        ),
      ).toBeVisible();
    });

    await test.step("nenhum pedido foi enviado ao backend", async () => {
      expect(apiRequests).toEqual([]);
    });
  });

  test("o Visitante numa página protegida vai para o início de sessão", async ({ page }) => {
    await test.step("abrir o início do Cliente sem sessão", async () => {
      await page.goto("/cliente");
      await expect(page).toHaveURL(/\/login$/);
    });
  });

  test("o Cliente numa página de administração vai para o seu início", async ({
    page,
    request,
  }) => {
    const client = await registerAndLogin(request, "CLIENT", "ts02.cliente");

    await test.step("abrir a administração com sessão de Cliente", async () => {
      await openWithSession(page, client.token);
      await page.goto("/admin");
      await expect(page).toHaveURL(/\/cliente$/);
    });

    await test.step("o cabeçalho do Cliente não tem as opções de administração", async () => {
      await expect(page.getByRole("link", { name: "Os meus serviços" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Contas" })).toHaveCount(0);
      await expect(page.getByRole("link", { name: "Categorias" })).toHaveCount(0);
    });
  });

  test("o Prestador numa página de Cliente vai para o seu início", async ({ page, request }) => {
    const provider = await createProviderWithProfile(request);

    await test.step("abrir o início do Cliente com sessão de Prestador com perfil", async () => {
      await openWithSession(page, provider.token);
      await page.goto("/cliente");
      await expect(page).toHaveURL(/\/prestador$/);
    });

    await test.step("o cabeçalho do Prestador não tem as opções do Cliente", async () => {
      await expect(page.getByRole("link", { name: "Solicitações recebidas" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Os meus serviços" })).toHaveCount(0);
    });
  });

  test("o Administrador acede à área de administração", async ({ page }) => {
    await test.step("iniciar sessão como Administrador (W03)", async () => {
      await loginViaUi(page, ADMIN_EMAIL, adminPassword());
      await expect(page).toHaveURL(/\/admin$/);
    });

    await test.step("o cabeçalho tem as opções de gestão de contas e de categorias", async () => {
      await expect(page.getByRole("link", { name: "Contas" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Categorias" })).toBeVisible();
    });

    await test.step("as páginas do Cliente levam ao início do Administrador", async () => {
      await page.goto("/cliente");
      await expect(page).toHaveURL(/\/admin$/);
      await page.goto("/pesquisa/prestadores");
      await expect(page).toHaveURL(/\/admin$/);
    });
  });

  test("o Prestador sem perfil é encaminhado para a página de criação do perfil", async ({
    page,
    request,
  }) => {
    const provider = await registerAndLogin(request, "PROVIDER", "ts02.semperfil");

    await test.step("abrir o início do Prestador sem perfil", async () => {
      await openWithSession(page, provider.token);
      await page.goto("/prestador");
      await expect(page).toHaveURL(/\/perfil\/criar$/);
      await expect(page.getByRole("link", { name: "Solicitações recebidas" })).toHaveCount(0);
    });

    await test.step("a alteração da palavra-passe continua acessível", async () => {
      await page.goto("/conta/palavra-passe");
      await expect(page.getByRole("heading", { name: "Alterar palavra-passe" })).toBeVisible();
    });
  });

  test("uma sessão que já não é válida leva ao início de sessão com a indicação", async ({
    page,
  }) => {
    await test.step("guardar um token inválido no browser", async () => {
      // Guardado uma só vez: o api() apaga-o ao receber o 401 e recarrega no início de sessão
      await page.goto("/login");
      await page.evaluate(`localStorage.setItem("token", "token-invalido")`);
    });

    await test.step("abrir uma página protegida", async () => {
      await page.goto("/cliente");
      await expect(page).toHaveURL(/\/login\?sessao=terminada$/);
      await expect(page.getByText("A sua sessão terminou. Inicie sessão novamente.")).toBeVisible();
    });
  });
});
