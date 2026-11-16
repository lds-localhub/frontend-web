import type { Page } from "@playwright/test";
import { registerAndLogin } from "./fixtures/accounts.ts";
import {
  createCategory,
  deactivateCategory,
  loginAsAdmin,
  uniqueCategoryName,
} from "./fixtures/admin.ts";
import { openWithSession } from "./fixtures/session.ts";
import { expect, test } from "./fixtures/test.ts";

// TS-WEB-04 — Gestão de categorias de serviços (RF-F003-01 a RF-F003-04) e resumo da administração (E39)

// Linha da tabela de categorias com este nome
function categoryRow(page: Page, name: string) {
  return page.getByRole("row").filter({ has: page.getByRole("rowheader", { name, exact: true }) });
}

// Abre a gestão de categorias (W52) com a sessão do Administrador
async function openCategories(page: Page, adminToken: string) {
  await openWithSession(page, adminToken);
  await page.goto("/admin/categorias");
  await expect(page.getByRole("heading", { name: "Gestão de categorias", level: 1 })).toBeVisible();
}

test.describe("TS-WEB-04 Gestão de categorias", () => {
  test("RF-F003-01 a 03: criar, editar e desativar uma categoria (com confirmação)", async ({
    page,
    request,
  }) => {
    const adminToken = await loginAsAdmin(request);
    const name = uniqueCategoryName("Serralharia");
    const newName = uniqueCategoryName("Serralharia e portões");

    await test.step("abrir a gestão de categorias (W52)", async () => {
      await openCategories(page, adminToken);
    });

    await test.step("criar a categoria na janela «Nova categoria» (W53)", async () => {
      await page.getByRole("button", { name: "Nova categoria" }).click();
      const dialog = page.getByRole("dialog", { name: "Nova categoria" });
      await dialog.getByLabel("Nome").fill(`  ${name}  `);
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

    await test.step("«Voltar» na confirmação mantém a categoria ativa", async () => {
      await page.getByRole("button", { name: `Desativar ${newName}` }).click();
      const dialog = page.getByRole("alertdialog", {
        name: `Desativar a categoria «${newName}»?`,
      });
      await expect(dialog).toContainText(
        "A categoria deixa de poder ser usada em perfis e em novos serviços. Esta ação não pode ser anulada.",
      );
      await dialog.getByRole("button", { name: "Voltar" }).click();
      await expect(dialog).toBeHidden();
      await expect(categoryRow(page, newName).getByText("Ativa", { exact: true })).toBeVisible();
    });

    await test.step("confirmar a desativação", async () => {
      await page.getByRole("button", { name: `Desativar ${newName}` }).click();
      await page
        .getByRole("alertdialog", { name: `Desativar a categoria «${newName}»?` })
        .getByRole("button", { name: "Desativar" })
        .click();
      await expect(page.getByText("Categoria desativada.")).toBeVisible();
      await expect(
        categoryRow(page, newName).getByText("Desativada", { exact: true }),
      ).toBeVisible();
      await expect(
        categoryRow(page, newName).getByRole("button", { name: `Desativar ${newName}` }),
      ).toHaveCount(0);
    });
  });

  test("RF-F003-04: o Administrador consulta as categorias ativas e desativadas com o estado", async ({
    page,
    request,
  }) => {
    const adminToken = await loginAsAdmin(request);
    const inactive = await createCategory(request, adminToken, uniqueCategoryName("Costura"));
    await deactivateCategory(request, adminToken, inactive.serviceCategoryId);

    await test.step("abrir a gestão de categorias", async () => {
      await openCategories(page, adminToken);
    });

    await test.step("a lista mostra o estado de cada categoria", async () => {
      await expect(
        categoryRow(page, "Canalização").getByText("Ativa", { exact: true }),
      ).toBeVisible();
      await expect(
        categoryRow(page, inactive.name).getByText("Desativada", { exact: true }),
      ).toBeVisible();
    });

    await test.step("uma categoria desativada só pode ser editada", async () => {
      await expect(
        categoryRow(page, inactive.name).getByRole("button", { name: `Editar ${inactive.name}` }),
      ).toBeVisible();
      await expect(
        categoryRow(page, inactive.name).getByRole("button", {
          name: `Desativar ${inactive.name}`,
        }),
      ).toHaveCount(0);
    });
  });

  test("RF-F003-01 e 02: nomes inválidos ou repetidos são rejeitados com o erro junto ao campo", async ({
    page,
    request,
  }) => {
    const adminToken = await loginAsAdmin(request);
    const category = await createCategory(request, adminToken, uniqueCategoryName("Pintura"));
    const createDialog = page.getByRole("dialog", { name: "Nova categoria" });
    const editDialog = page.getByRole("dialog", { name: "Editar categoria" });

    await test.step("abrir a janela «Nova categoria»", async () => {
      await openCategories(page, adminToken);
      await page.getByRole("button", { name: "Nova categoria" }).click();
    });

    await test.step("nome só com espaços", async () => {
      await createDialog.getByLabel("Nome").fill("   ");
      await createDialog.getByRole("button", { name: "Guardar" }).click();
      await expect(createDialog.getByText("Indique o nome.")).toBeVisible();
    });

    await test.step("nome com 61 caracteres", async () => {
      await createDialog.getByLabel("Nome").fill("A".repeat(61));
      await createDialog.getByRole("button", { name: "Guardar" }).click();
      await expect(createDialog.getByText("O nome tem, no máximo, 60 caracteres.")).toBeVisible();
    });

    await test.step("nome já existente com maiúsculas diferentes (409 do backend)", async () => {
      await createDialog.getByLabel("Nome").fill("canalização");
      await createDialog.getByRole("button", { name: "Guardar" }).click();
      await expect(createDialog.getByText("Já existe uma categoria com este nome.")).toBeVisible();
      await expect(createDialog.getByLabel("Nome")).toHaveAttribute("aria-invalid", "true");
    });

    await test.step("«Cancelar» fecha a janela sem criar a categoria", async () => {
      await createDialog.getByRole("button", { name: "Cancelar" }).click();
      await expect(createDialog).toBeHidden();
      await expect(categoryRow(page, "canalização")).toHaveCount(0);
    });

    await test.step("editar com o nome de outra categoria", async () => {
      await page.getByRole("button", { name: `Editar ${category.name}` }).click();
      await editDialog.getByLabel("Nome").fill("ELETRICIDADE");
      await editDialog.getByRole("button", { name: "Guardar" }).click();
      await expect(editDialog.getByText("Já existe uma categoria com este nome.")).toBeVisible();
      await expect(editDialog).toBeVisible();
    });
  });

  test("RF-F003-03: a desativação de uma categoria em uso é rejeitada com o motivo", async ({
    page,
    request,
  }) => {
    const adminToken = await loginAsAdmin(request);

    await test.step("abrir a gestão de categorias", async () => {
      await openCategories(page, adminToken);
    });

    // «Canalização» está no perfil do Prestador ativo dos dados de referência
    await test.step("confirmar a desativação de «Canalização»", async () => {
      await page.getByRole("button", { name: "Desativar Canalização" }).click();
      await page
        .getByRole("alertdialog", { name: "Desativar a categoria «Canalização»?" })
        .getByRole("button", { name: "Desativar" })
        .click();
    });

    await test.step("o motivo do backend aparece e a categoria continua ativa", async () => {
      // A Documentação da API mostra «Não é possível desativar «Canalização»: …»; o backend v1.1.0
      // responde «A categoria está associada a N Prestador(es) ativo(s)…». Aceitam-se as duas
      await expect(
        page.getByText(/Não é possível desativar «Canalização»|A categoria está associada a \d+/),
      ).toBeVisible();
      await expect(
        categoryRow(page, "Canalização").getByText("Ativa", { exact: true }),
      ).toBeVisible();
    });
  });
});

test.describe("TS-WEB-04 Resumo e acesso à administração", () => {
  test("E39: o início da administração mostra os totais devolvidos pelo backend", async ({
    page,
    request,
  }) => {
    const adminToken = await loginAsAdmin(request);

    await test.step("abrir o início da administração (W50)", async () => {
      await openWithSession(page, adminToken);
      await page.goto("/admin");
      await expect(page.getByRole("heading", { name: "Administração", level: 1 })).toBeVisible();
      await expect(page.getByRole("link", { name: /Gerir contas/ })).toBeVisible();
      await expect(page.getByRole("link", { name: /Gerir categorias/ })).toBeVisible();
    });

    await test.step("os totais são os do E39", async () => {
      // Os outros testes criam contas e categorias ao mesmo tempo: repete até os valores coincidirem
      await expect(async () => {
        await page.reload();
        const response = await request.get("/api/admin/summary", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        expect(response.status()).toBe(200);
        const summary = (await response.json()) as {
          activeAccounts: number;
          inactiveAccounts: number;
          activeCategories: number;
        };
        for (const [label, value] of [
          ["Contas ativas", summary.activeAccounts],
          ["Contas desativadas", summary.inactiveAccounts],
          ["Categorias ativas", summary.activeCategories],
        ] as const) {
          await expect(page.getByRole("article", { name: label })).toContainText(
            value.toLocaleString("pt-PT"),
            { timeout: 2000 },
          );
        }
      }).toPass({ timeout: 20_000 });
    });
  });

  test("a gestão de categorias não é acessível ao Cliente", async ({ page, request }) => {
    const client = await registerAndLogin(request, "CLIENT", "ts04.cliente");

    await test.step("o Cliente que abre a gestão de categorias vai para o seu início", async () => {
      await openWithSession(page, client.token);
      await page.goto("/admin/categorias");
      await expect(page).toHaveURL(/\/cliente$/);
      await expect(page.getByRole("heading", { name: "Gestão de categorias" })).toHaveCount(0);
    });
  });

  test("a gestão de categorias não é acessível ao Prestador", async ({ page, request }) => {
    const provider = await registerAndLogin(request, "PROVIDER", "ts04.prestador");

    await test.step("o Prestador sem perfil vai para a criação do perfil", async () => {
      await openWithSession(page, provider.token);
      await page.goto("/admin/categorias");
      await expect(page).toHaveURL(/\/perfil\/criar$/);
      await expect(page.getByRole("heading", { name: "Gestão de categorias" })).toHaveCount(0);
    });
  });
});
