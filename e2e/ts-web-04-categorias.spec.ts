import type { Page } from "@playwright/test";
import { loginAsAdmin, uniqueCategoryName } from "./fixtures/admin.ts";
import { openWithSession } from "./fixtures/session.ts";
import { expect, test } from "./fixtures/test.ts";

// TS-WEB-04 — Gestão de categorias (RF-F003-01 a RF-F003-04)

// Linha da tabela de categorias com este nome
function categoryRow(page: Page, name: string) {
  return page.getByRole("row").filter({ has: page.getByRole("rowheader", { name, exact: true }) });
}

test.describe("TS-WEB-04 Gestão de categorias", () => {
  test("criar, editar e desativar uma categoria (com confirmação)", async ({ page, request }) => {
    const adminToken = await loginAsAdmin(request);
    const name = uniqueCategoryName("Serralharia");
    const newName = uniqueCategoryName("Serralharia e portões");

    await test.step("abrir a gestão de categorias (W52)", async () => {
      await openWithSession(page, adminToken);
      await page.goto("/admin/categorias");
      await expect(
        page.getByRole("heading", { name: "Gestão de categorias", level: 1 }),
      ).toBeVisible();
    });

    await test.step("criar a categoria na janela «Nova categoria» (W53)", async () => {
      await page.getByRole("button", { name: "Nova categoria" }).click();
      const dialog = page.getByRole("dialog", { name: "Nova categoria" });
      await dialog.getByLabel("Nome").fill(name);
      await dialog.getByRole("button", { name: "Guardar" }).click();
      await expect(dialog).toBeHidden();
      await expect(page.getByText("Categoria criada.")).toBeVisible();
      await expect(categoryRow(page, name).getByText("Ativa", { exact: true })).toBeVisible();
    });

    await test.step("editar o nome da categoria (W53)", async () => {
      await page.getByRole("button", { name: `Editar ${name}` }).click();
      const dialog = page.getByRole("dialog", { name: "Editar categoria" });
      await expect(dialog.getByLabel("Nome")).toHaveValue(name);
      await dialog.getByLabel("Nome").fill(newName);
      await dialog.getByRole("button", { name: "Guardar" }).click();
      await expect(dialog).toBeHidden();
      await expect(page.getByText("Categoria atualizada.")).toBeVisible();
      await expect(categoryRow(page, newName).getByText("Ativa", { exact: true })).toBeVisible();
      await expect(categoryRow(page, name)).toHaveCount(0);
    });

    await test.step("desativar a categoria, com confirmação", async () => {
      await page.getByRole("button", { name: `Desativar ${newName}` }).click();
      const dialog = page.getByRole("alertdialog", {
        name: `Desativar a categoria «${newName}»?`,
      });
      await expect(dialog).toContainText(
        "A categoria deixa de poder ser usada em perfis e em novos serviços. Esta ação não pode ser anulada.",
      );
      await dialog.getByRole("button", { name: "Desativar" }).click();
      await expect(dialog).toBeHidden();
      await expect(page.getByText("Categoria desativada.")).toBeVisible();
      await expect(
        categoryRow(page, newName).getByText("Desativada", { exact: true }),
      ).toBeVisible();
    });
  });
});
