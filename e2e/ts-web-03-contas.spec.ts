import type { Page } from "@playwright/test";
import { registerAndLogin, uniqueId } from "./fixtures/accounts.ts";
import { ADMIN_EMAIL, loginAsAdmin } from "./fixtures/admin.ts";
import {
  createClientWithCancellationAlert,
  createProviderWithLowRatingAlert,
} from "./fixtures/conduct.ts";
import { openWithSession } from "./fixtures/session.ts";
import { expect, test } from "./fixtures/test.ts";

// TS-WEB-03 — Gestão de contas pelo administrador (RF-F002-01, RF-F002-02, RF-F002-03, RF-F002-05)

// Linha da tabela de contas com este nome
function accountRow(page: Page, name: string) {
  return page.getByRole("row").filter({ has: page.getByRole("rowheader", { name, exact: true }) });
}

// Escolhe uma opção num filtro em pílula («Papel: Todos», «Estado: Todos»)
async function chooseFilter(page: Page, filter: string, option: string) {
  await page.getByRole("combobox", { name: filter }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test.describe("TS-WEB-03 Gestão de contas pelo administrador", () => {
  test("consultar, filtrar, desativar, ativar e redefinir a palavra-passe", async ({
    page,
    request,
  }) => {
    const id = uniqueId();
    const cancellationsName = `A TS03 cancelamentos ${id}`;
    const ratingName = `A TS03 classificacao ${id}`;
    const clientName = `A TS03 cliente ${id}`;
    await createClientWithCancellationAlert(request, cancellationsName);
    await createProviderWithLowRatingAlert(request, ratingName);
    const client = await registerAndLogin(request, "CLIENT", "ts03.cliente", clientName);
    const adminToken = await loginAsAdmin(request);

    await test.step("consultar as contas, com os alertas de conduta (RF-F002-01)", async () => {
      await openWithSession(page, adminToken);
      await page.goto("/admin/contas");
      await expect(page.getByRole("heading", { name: "Gestão de contas", level: 1 })).toBeVisible();

      // Conta sem alertas
      const row = accountRow(page, clientName);
      await expect(row.getByText(client.email)).toBeVisible();
      await expect(row.getByText("Ativa", { exact: true })).toBeVisible();
      await expect(row.getByLabel("Sem alertas")).toBeVisible();

      // Contas com um alerta de cada tipo: o detalhe aparece ao passar o cursor
      await accountRow(page, cancellationsName).getByRole("button", { name: "1 alerta" }).hover();
      await expect(
        page.getByText("Cancelamentos de serviços atribuídos: 2 de 3 (67%)"),
      ).toBeVisible();
      await page.mouse.move(0, 0);

      await accountRow(page, ratingName).getByRole("button", { name: "1 alerta" }).hover();
      await expect(page.getByText("Classificação média baixa: 1,7 (3 avaliações)")).toBeVisible();
      await page.mouse.move(0, 0);

      // As contas de Administrador não aparecem
      await expect(page.getByText(ADMIN_EMAIL)).toHaveCount(0);
    });

    await test.step("filtrar por papel e por estado (RF-F002-01)", async () => {
      await chooseFilter(page, "Papel", "Cliente");
      await chooseFilter(page, "Estado", "Ativa");
      await expect(page).toHaveURL(/role=CLIENT/);
      await expect(page).toHaveURL(/status=ACTIVE/);
      await expect(page.getByRole("cell", { name: "Prestador de Serviços" })).toHaveCount(0);
      await expect(page.getByRole("cell", { name: "Desativada" })).toHaveCount(0);
      await expect(accountRow(page, clientName)).toBeVisible();
    });

    await test.step("desativar a conta, com confirmação (RF-F002-02)", async () => {
      await page.getByRole("button", { name: `Desativar ${clientName}` }).click();
      const dialog = page.getByRole("alertdialog", {
        name: `Desativar a conta de ${clientName}?`,
      });
      await expect(dialog).toContainText("A conta deixa de poder iniciar sessão");
      await dialog.getByRole("button", { name: "Desativar" }).click();
      await expect(dialog).toBeHidden();
      await expect(page.getByText("Conta desativada.")).toBeVisible();

      // Com o filtro «Ativa», a conta sai da lista; com «Desativada», aparece com o novo estado
      await expect(accountRow(page, clientName)).toHaveCount(0);
      await chooseFilter(page, "Estado", "Desativada");
      await expect(
        accountRow(page, clientName).getByText("Desativada", { exact: true }),
      ).toBeVisible();
    });

    await test.step("ativar a conta (RF-F002-03)", async () => {
      await page.getByRole("button", { name: `Ativar ${clientName}` }).click();
      await expect(page.getByText("Conta ativada.")).toBeVisible();
      await expect(accountRow(page, clientName)).toHaveCount(0);
      await chooseFilter(page, "Estado", "Todos");
      await expect(accountRow(page, clientName).getByText("Ativa", { exact: true })).toBeVisible();
    });

    await test.step("redefinir a palavra-passe, com confirmação (RF-F002-05)", async () => {
      await page
        .getByRole("button", { name: `Redefinir a palavra-passe de ${clientName}` })
        .click();
      const confirm = page.getByRole("alertdialog", {
        name: `Redefinir a palavra-passe de ${clientName}?`,
      });
      await expect(confirm).toContainText(client.email);
      // A palavra-passe é gerada pelo backend: lê-se da resposta ao pedido que o ecrã faz (E41)
      // para verificar que a janela mostra exatamente essa
      const [response] = await Promise.all([
        page.waitForResponse((r) => r.url().endsWith("/reset-password")),
        confirm.getByRole("button", { name: "Redefinir" }).click(),
      ]);
      const { temporaryPassword } = (await response.json()) as { temporaryPassword: string };

      const dialog = page.getByRole("dialog", { name: "Palavra-passe redefinida" });
      await expect(dialog).toContainText("Esta palavra-passe só é mostrada uma vez.");
      await expect(dialog.getByText(temporaryPassword, { exact: true })).toBeVisible();

      await dialog.getByRole("button", { name: "Fechar" }).click();
      await expect(dialog).toBeHidden();
      await expect(page.getByText(temporaryPassword)).toHaveCount(0);
    });
  });
});
