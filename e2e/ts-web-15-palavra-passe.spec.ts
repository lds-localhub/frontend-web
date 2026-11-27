import { registerAndLogin } from "./fixtures/accounts.ts";
import { loginViaUi, logoutViaUi } from "./fixtures/session.ts";
import { expect, test } from "./fixtures/test.ts";

// TS-WEB-15 — Alterar a palavra-passe

test.describe("TS-WEB-15 Alterar a palavra-passe", () => {
  test("alterar a palavra-passe, terminar sessão e entrar com a nova", async ({
    page,
    request,
  }) => {
    const account = await registerAndLogin(request, "CLIENT", "ts15");

    await test.step("1. Iniciar sessão no W03 e abrir «Alterar palavra-passe» no menu da conta", async () => {
      await loginViaUi(page, account.email, account.password);
      await expect(page).toHaveURL(/\/cliente$/);
      await page.getByRole("button", { name: /Menu da conta/ }).click();
      await page.getByRole("menuitem", { name: "Alterar palavra-passe" }).click();
      await expect(page).toHaveURL(/\/conta\/palavra-passe$/);
    });

    const current = page.getByLabel("Palavra-passe atual");
    const next = page.getByLabel("Nova palavra-passe", { exact: true });
    const confirm = page.getByLabel("Confirmar nova palavra-passe");
    const save = page.getByRole("button", { name: "Guardar" });

    await test.step("2. Preencher a palavra-passe atual, a nova e a confirmação e carregar em «Guardar»", async () => {
      await current.fill(account.password);
      await next.fill("Nova2027ab");
      await confirm.fill("Nova2027ab");
      await save.click();
      await expect(page.getByText("Palavra-passe alterada.")).toBeVisible();
      await expect(current).toHaveValue("");
    });

    await test.step("3. Terminar sessão no menu da conta", async () => {
      await logoutViaUi(page);
      await expect(page).toHaveURL(/\/login$/);
    });

    await test.step("4. Iniciar sessão com a palavra-passe nova", async () => {
      await loginViaUi(page, account.email, "Nova2027ab");
      await expect(page).toHaveURL(/\/cliente$/);
    });
  });
});
