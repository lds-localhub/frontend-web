import { registerAndLogin } from "./fixtures/accounts.ts";
import { createProviderWithProfile } from "./fixtures/providers.ts";
import {
  acceptProposal,
  createDirectRequestService,
  createPublicService,
  submitProposal,
} from "./fixtures/services.ts";
import { loginViaUi } from "./fixtures/session.ts";
import { expect, test } from "./fixtures/test.ts";

// TS-WEB-12 — Cancelar serviços (Cliente)

// Data apresentada pela aplicação, sem depender do fuso horário da execução
const DATE = String.raw`\d{2}/\d{2}/\d{4}`;

test.describe("TS-WEB-12 Cancelar serviços (Cliente)", () => {
  test("caso 1: serviço com solicitações diretas, aberto, a partir da lista", async ({
    page,
    request,
  }) => {
    const provider = await createProviderWithProfile(request);
    const client = await registerAndLogin(request, "CLIENT", "ts12a");
    const title = "Reparar o esquentador";
    await createDirectRequestService(request, client, [provider.professionalProfileId], { title });
    const row = page.getByRole("row").filter({ hasText: title });

    await test.step("1. Início do Cliente → «Ver todos ›» → «Cancelar» na linha do serviço", async () => {
      await loginViaUi(page, client.email, client.password);
      await page.getByRole("link", { name: "Ver todos ›" }).click();
      await expect(page).toHaveURL(/\/servicos$/);
      await expect(row).toContainText("Solicitações diretas (1)");
      await row.getByRole("button", { name: "Cancelar", exact: true }).click();
      await expect(
        page.getByRole("alertdialog", { name: `Cancelar o serviço «${title}»?` }),
      ).toContainText(
        "O serviço passa a cancelado e as propostas e solicitações ainda pendentes ficam sem efeito. Esta ação não pode ser anulada.",
      );
    });

    await test.step("2. «Cancelar serviço»", async () => {
      await page
        .getByRole("alertdialog", { name: `Cancelar o serviço «${title}»?` })
        .getByRole("button", { name: "Cancelar serviço" })
        .click();
      await expect(page.getByText("Serviço cancelado.")).toBeVisible();
      await expect(row).toContainText("Cancelado");
      await expect(row.getByRole("button", { name: "Cancelar", exact: true })).toHaveCount(0);
    });

    await test.step("3. «Abrir» o serviço", async () => {
      await row.getByRole("button", { name: "Abrir" }).click();
      await expect(page.getByRole("main")).toContainText(
        new RegExp(`Cancelou este serviço a ${DATE}, quando ainda estava aberto\\.`),
      );
      await expect(page.getByRole("article")).toContainText(
        "Ficou sem efeito quando cancelou o serviço.",
      );
      for (const action of ["Cancelar serviço", "Marcar como realizado", "Avaliar serviço"]) {
        await expect(page.getByRole("button", { name: action })).toHaveCount(0);
      }
    });
  });

  test("caso 2: serviço aberto a propostas, atribuído, a partir do detalhe", async ({
    page,
    request,
  }) => {
    const provider = await createProviderWithProfile(request);
    const client = await registerAndLogin(request, "CLIENT", "ts12b");
    const title = "Instalar um lava-loiça";
    const serviceId = await createPublicService(request, client, { title });
    await acceptProposal(request, client, await submitProposal(request, provider, serviceId));
    const dialog = page.getByRole("alertdialog", { name: `Cancelar o serviço «${title}»?` });

    await test.step("1. Em «Os meus serviços», «Abrir» o serviço → «Cancelar serviço»", async () => {
      await loginViaUi(page, client.email, client.password);
      await page.getByRole("link", { name: "Ver todos ›" }).click();
      await page
        .getByRole("row")
        .filter({ hasText: title })
        .getByRole("button", { name: "Abrir" })
        .click();
      await expect(page).toHaveURL(new RegExp(`/servicos/${serviceId}$`));
      await page.getByRole("button", { name: "Cancelar serviço" }).click();
      await expect(dialog).toContainText(
        "O serviço passa a cancelado e o cancelamento fica registado no histórico. Esta ação não pode ser anulada.",
      );
    });

    await test.step("2. «Cancelar serviço»", async () => {
      await dialog.getByRole("button", { name: "Cancelar serviço" }).click();
      await expect(page.getByText("Serviço cancelado.")).toBeVisible();
      await expect(page.getByRole("main")).toContainText(
        new RegExp(`Cancelou este serviço a ${DATE}\\.`),
      );
      for (const action of ["Cancelar serviço", "Marcar como realizado", "Avaliar serviço"]) {
        await expect(page.getByRole("button", { name: action })).toHaveCount(0);
      }
    });
  });
});
