import type { Page } from "@playwright/test";
import { registerAndLogin } from "./fixtures/accounts.ts";
import { createProviderWithProfile } from "./fixtures/providers.ts";
import { createAssignedService } from "./fixtures/services.ts";
import { loginViaUi } from "./fixtures/session.ts";
import { expect, test } from "./fixtures/test.ts";

// TS-WEB-18 — Cancelar serviços (Prestador) (RF-F007-05, RF-F008-04: cancelamento pelo Prestador
// contratado)
//
// O Prestador é criado neste teste, por isso as suas propostas são só as dos dois serviços
// atribuídos preparados pela API.

const consequences =
  "O serviço passa a cancelado e o cancelamento fica registado no histórico como feito por si. Esta ação não pode ser anulada.";

// Linha da tabela das propostas com o serviço indicado
function row(page: Page, title: string) {
  return page.getByRole("row").filter({ hasText: title });
}

// Janela de confirmação do cancelamento do serviço indicado
function cancelDialog(page: Page, title: string) {
  return page.getByRole("alertdialog", { name: `Cancelar o serviço «${title}»?` });
}

test.describe("TS-WEB-18 Cancelar serviços (Prestador)", () => {
  test("cancelar um serviço atribuído a partir da lista e outro a partir do detalhe", async ({
    page,
    request,
  }) => {
    const provider = await createProviderWithProfile(request);
    const client = await registerAndLogin(request, "CLIENT", "ts18");
    const publicTitle = "Substituir o esquentador";
    const directTitle = "Reparar a fuga do autoclismo";
    await createAssignedService(request, client, provider, {
      title: publicTitle,
      proposalModel: "PUBLIC",
    });
    await createAssignedService(request, client, provider, {
      title: directTitle,
      proposalModel: "DIRECT_REQUEST",
    });

    await test.step("1. A partir da lista. Em «As minhas propostas» (W38), «Cancelar» num dos serviços", async () => {
      await loginViaUi(page, provider.email, provider.password);
      await expect(page).toHaveURL(/\/prestador$/);
      await page
        .getByRole("navigation", { name: "Principal" })
        .getByRole("link", { name: "As minhas propostas" })
        .click();
      await expect(page).toHaveURL(/\/propostas$/);
      await row(page, publicTitle).getByRole("button", { name: "Cancelar", exact: true }).click();
      await expect(cancelDialog(page, publicTitle)).toBeVisible();
      await expect(cancelDialog(page, publicTitle)).toContainText(consequences);
    });

    await test.step("2. «Cancelar serviço»", async () => {
      await cancelDialog(page, publicTitle)
        .getByRole("button", { name: "Cancelar serviço" })
        .click();
      await expect(page.getByText("Serviço cancelado.")).toBeVisible();
      await expect(row(page, publicTitle)).toContainText("Cancelado");
      await expect(
        row(page, publicTitle).getByRole("button", { name: "Cancelar", exact: true }),
      ).toHaveCount(0);
    });

    await test.step("3. A partir do detalhe. «Abrir» o outro serviço", async () => {
      await row(page, directTitle).getByRole("button", { name: "Abrir" }).click();
      await expect(page).toHaveURL(/\/propostas\/\d+$/);
      await expect(page.getByRole("heading", { level: 1, name: directTitle })).toBeVisible();
      await expect(page.getByText("O trabalho foi-lhe atribuído.")).toBeVisible();
      await expect(page.getByRole("button", { name: "Cancelar serviço" })).toBeVisible();
    });

    await test.step("4. «Cancelar serviço» → a mesma janela → «Cancelar serviço»", async () => {
      await page.getByRole("button", { name: "Cancelar serviço" }).click();
      await expect(cancelDialog(page, directTitle)).toContainText(consequences);
      await cancelDialog(page, directTitle)
        .getByRole("button", { name: "Cancelar serviço" })
        .click();
      await expect(page.getByText("Serviço cancelado.")).toBeVisible();
      await expect(page.getByText("O serviço foi cancelado.")).toBeVisible();
      await expect(page.getByRole("button", { name: "Cancelar serviço" })).toHaveCount(0);
    });
  });
});
