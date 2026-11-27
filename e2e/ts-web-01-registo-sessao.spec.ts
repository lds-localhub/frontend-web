import { TEST_PASSWORD, uniqueEmail } from "./fixtures/accounts.ts";
import { logoutViaUi } from "./fixtures/session.ts";
import { expect, test } from "./fixtures/test.ts";

// TS-WEB-01 — Registo, início e fim de sessão

test.describe("TS-WEB-01 Registo, início e fim de sessão", () => {
  test("registar uma conta de Cliente, iniciar sessão e terminar sessão", async ({ page }) => {
    const email = uniqueEmail("ts01.cliente");

    await test.step("1. Registar a conta de Cliente no W02 (papel «Cliente») e carregar em «Criar conta»", async () => {
      await page.goto("/registar");
      await expect(page.getByRole("radio")).toHaveCount(2); // só Cliente e Prestador de Serviços
      await page.getByLabel("Nome").fill("Cliente TS-WEB-01");
      await page.getByLabel("E-mail").fill(email);
      await page.getByLabel("Palavra-passe").fill(TEST_PASSWORD);
      await page.getByRole("radio", { name: "Cliente" }).check();
      await page.getByRole("button", { name: "Criar conta" }).click();
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByText("Conta criada. Inicie sessão.")).toBeVisible();
    });

    await test.step("2. Iniciar sessão no W03 e carregar em «Entrar»", async () => {
      await page.getByLabel("E-mail").fill(email);
      await page.getByLabel("Palavra-passe").fill(TEST_PASSWORD);
      await page.getByRole("button", { name: "Entrar" }).click();
      await expect(page).toHaveURL(/\/cliente$/);
      await expect(
        page.getByRole("button", { name: /Menu da conta de Cliente TS-WEB-01/ }),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: "Os meus serviços" })).toBeVisible();
    });

    await test.step("3. Terminar sessão no menu da conta", async () => {
      await logoutViaUi(page);
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByRole("link", { name: "Iniciar sessão" })).toBeVisible();
    });
  });
});
