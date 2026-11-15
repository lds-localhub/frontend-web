import { registerAndLogin, TEST_PASSWORD, uniqueEmail } from "./fixtures/accounts.ts";
import { loginViaUi, storedToken } from "./fixtures/session.ts";
import { expect, test } from "./fixtures/test.ts";

// TS-WEB-01 — Registo, início e fim de sessão (RF-F001-01, RF-F001-02, RF-F001-04)

test.describe("TS-WEB-01 Registo, início e fim de sessão", () => {
  test("RF-F001-01 regista um Cliente e o início de sessão leva ao início do Cliente", async ({
    page,
  }) => {
    const email = uniqueEmail("ts01.cliente");

    await test.step("registar a conta de Cliente (W02)", async () => {
      await page.goto("/registar");
      await expect(page.getByRole("radio")).toHaveCount(2); // só Cliente e Prestador de Serviços
      await page.getByLabel("Nome").fill("Cliente TS-WEB-01");
      await page.getByLabel("E-mail").fill(email);
      await page.getByLabel("Palavra-passe").fill(TEST_PASSWORD);
      await page.getByRole("radio", { name: "Cliente" }).check();
      await page.getByRole("button", { name: "Criar conta" }).click();
    });

    await test.step("vai para o início de sessão com a indicação de conta criada", async () => {
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByText("Conta criada. Inicie sessão.")).toBeVisible();
    });

    await test.step("iniciar sessão (W03) leva ao início do Cliente", async () => {
      await page.getByLabel("E-mail").fill(email);
      await page.getByLabel("Palavra-passe").fill(TEST_PASSWORD);
      await page.getByRole("button", { name: "Entrar" }).click();
      await expect(page).toHaveURL(/\/cliente$/);
      await expect(
        page.getByRole("button", { name: /Menu da conta de Cliente TS-WEB-01/ }),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: "Os meus serviços" })).toBeVisible();
    });
  });

  test("RF-F001-01 regista um Prestador, que é encaminhado para criar o perfil", async ({
    page,
  }) => {
    const email = uniqueEmail("ts01.prestador");

    await page.goto("/registar");
    await page.getByLabel("Nome").fill("Prestador TS-WEB-01");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Palavra-passe").fill(TEST_PASSWORD);
    await page.getByRole("radio", { name: "Prestador de Serviços" }).check();
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page).toHaveURL(/\/login$/);

    await loginViaUi(page, email, TEST_PASSWORD);
    await expect(page).toHaveURL(/\/perfil\/criar$/);
    await expect(page.getByRole("heading", { name: "Criar perfil profissional" })).toBeVisible();
  });

  test("RF-F001-01 mostra os erros de validação junto de cada campo", async ({ page, request }) => {
    const existing = await registerAndLogin(request, "CLIENT", "ts01.existente");

    await page.goto("/registar");

    await test.step("campos vazios", async () => {
      await page.getByRole("button", { name: "Criar conta" }).click();
      await expect(page.getByText("Indique o nome.")).toBeVisible();
      await expect(page.getByText("Indique o e-mail.")).toBeVisible();
    });

    await test.step("palavras-passe sem algarismo ou com menos de 8 caracteres", async () => {
      const rule =
        "A palavra-passe tem de ter, no mínimo, 8 caracteres, com pelo menos uma letra e um algarismo.";
      await page.getByLabel("Palavra-passe").fill("abcdefgh");
      await page.getByRole("button", { name: "Criar conta" }).click();
      await expect(page.getByText(rule)).toBeVisible();
      await page.getByLabel("Palavra-passe").fill("1234567");
      await expect(page.getByText(rule)).toBeVisible();
    });

    await test.step("e-mail já registado, com maiúsculas diferentes (409 do backend)", async () => {
      await page.getByLabel("Nome").fill("Outra conta");
      await page.getByLabel("E-mail").fill(existing.email.toUpperCase());
      await page.getByLabel("Palavra-passe").fill(TEST_PASSWORD);
      await page.getByRole("button", { name: "Criar conta" }).click();
      // A Documentação da API mostra «Este e-mail já está registado.»; o backend v1.1.0 responde
      // «Já existe uma conta com este e-mail.». O que se verifica é a mensagem do backend junto ao campo
      const email = page.getByLabel("E-mail");
      await expect(email).toHaveAttribute("aria-invalid", "true");
      await expect(
        page.getByText(/(já está registado|Já existe uma conta com este e-mail)\./),
      ).toBeVisible();
      await expect(page).toHaveURL(/\/registar$/);
    });
  });

  test("RF-F001-04 terminar sessão revoga a sessão e fecha as páginas protegidas", async ({
    page,
    request,
  }) => {
    const account = await registerAndLogin(request, "CLIENT", "ts01.logout");
    await loginViaUi(page, account.email, account.password);
    await expect(page).toHaveURL(/\/cliente$/);
    const token = await storedToken(page);

    await test.step("terminar sessão no menu da conta", async () => {
      await page.getByRole("button", { name: /Menu da conta/ }).click();
      await page.getByRole("menuitem", { name: "Terminar sessão" }).click();
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByRole("link", { name: "Iniciar sessão" })).toBeVisible();
    });

    await test.step("a sessão deixou de ser aceite pelo backend", async () => {
      const response = await request.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(response.status()).toBe(401);
    });

    await test.step("uma página protegida leva ao início de sessão", async () => {
      await page.goto("/conta/palavra-passe");
      await expect(page).toHaveURL(/\/login$/);
    });
  });
});
