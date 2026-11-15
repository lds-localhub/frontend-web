import { login, registerAndLogin } from "./fixtures/accounts.ts";
import { openWithSession } from "./fixtures/session.ts";
import { expect, test } from "./fixtures/test.ts";

// TS-WEB-15 — Alterar a palavra-passe (RF-F001-07)

test.describe("TS-WEB-15 Alterar a palavra-passe", () => {
  test("valida a palavra-passe atual e as regras da nova, e altera-a", async ({
    page,
    request,
  }) => {
    const account = await registerAndLogin(request, "CLIENT", "ts15");
    await openWithSession(page, account.token);
    await page.goto("/conta/palavra-passe");

    const current = page.getByLabel("Palavra-passe atual");
    const next = page.getByLabel("Nova palavra-passe", { exact: true });
    const confirm = page.getByLabel("Confirmar nova palavra-passe");
    const save = page.getByRole("button", { name: "Guardar" });

    await test.step("regras da nova palavra-passe e confirmação diferente", async () => {
      await current.fill(account.password);
      await next.fill("abcdefgh");
      await confirm.fill("outra2026");
      await save.click();
      await expect(
        page.getByText(
          "A palavra-passe tem de ter, no mínimo, 8 caracteres, com pelo menos uma letra e um algarismo.",
        ),
      ).toBeVisible();
      await expect(
        page.getByText("A confirmação não corresponde à nova palavra-passe."),
      ).toBeVisible();
    });

    await test.step("palavra-passe atual errada (400 do backend, junto ao campo)", async () => {
      await current.fill("Errada2026");
      await next.fill("Nova2027ab");
      await confirm.fill("Nova2027ab");
      await save.click();
      await expect(page.getByText("A palavra-passe atual está incorreta.")).toBeVisible();
    });

    await test.step("alteração com sucesso", async () => {
      await current.fill(account.password);
      await save.click();
      await expect(page.getByText("Palavra-passe alterada.")).toBeVisible();
      await expect(current).toHaveValue("");
    });

    await test.step("só a nova palavra-passe inicia sessão", async () => {
      const withNew = await login(request, account.email, "Nova2027ab");
      expect(withNew.user.userId).toBe(account.user.userId);
      const withOld = await request.post("/api/auth/login", {
        data: { email: account.email, password: account.password, client: "WEB" },
      });
      expect(withOld.status()).toBe(401);
    });
  });
});
