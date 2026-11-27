import type { Page } from "@playwright/test";
import { registerAndLogin } from "./fixtures/accounts.ts";
import { createProviderWithProfile } from "./fixtures/providers.ts";
import { createDirectRequestService, submitProposal } from "./fixtures/services.ts";
import { loginViaUi } from "./fixtures/session.ts";
import { expect, test } from "./fixtures/test.ts";

// TS-WEB-10 — Ciclo de um serviço com solicitações diretas
//
// O Cliente é criado neste teste, por isso o serviço preparado pela API é o único dos seus serviços.

// Cartão da solicitação do Prestador indicado, no detalhe do serviço
function card(page: Page, providerName: string) {
  return page.getByRole("article").filter({ hasText: providerName });
}

test.describe("TS-WEB-10 Ciclo de um serviço com solicitações diretas", () => {
  test("recusar e aceitar propostas, marcar como realizado e avaliar", async ({
    page,
    request,
  }) => {
    const declined = await createProviderWithProfile(request);
    const accepted = await createProviderWithProfile(request);
    const silent = await createProviderWithProfile(request);
    const client = await registerAndLogin(request, "CLIENT", "ts10");
    const title = "Substituir o autoclismo";
    const serviceId = await createDirectRequestService(
      request,
      client,
      [
        declined.professionalProfileId,
        accepted.professionalProfileId,
        silent.professionalProfileId,
      ],
      { title },
    );
    await submitProposal(request, declined, serviceId, 90);
    await submitProposal(request, accepted, serviceId, 75);

    await test.step("1. No início do Cliente, «Serviços recentes» → «Abrir»", async () => {
      await loginViaUi(page, client.email, client.password);
      await expect(page).toHaveURL(/\/cliente$/);
      await page
        .getByRole("row")
        .filter({ hasText: title })
        .getByRole("button", { name: "Abrir" })
        .click();
      await expect(page).toHaveURL(new RegExp(`/servicos/${serviceId}$`));
      await expect(page.getByRole("heading", { name: title })).toBeVisible();
      await expect(page.getByRole("button", { name: "Aceitar proposta" })).toHaveCount(2);
      await expect(card(page, silent.user.name)).toContainText("A aguardar resposta do Prestador.");
    });

    await test.step("2. «Recusar proposta» numa → «Recusar»", async () => {
      await card(page, declined.user.name)
        .getByRole("button", { name: "Recusar proposta" })
        .click();
      const dialog = page.getByRole("alertdialog", {
        name: `Recusar a proposta de ${declined.user.name}?`,
      });
      await expect(dialog).toBeVisible();
      await dialog.getByRole("button", { name: "Recusar" }).click();
      await expect(page.getByText("Proposta recusada.")).toBeVisible();
      await expect(page.getByRole("button", { name: "Aceitar proposta" })).toHaveCount(1);
    });

    await test.step("3. «Aceitar proposta» na outra → «Confirmar»", async () => {
      await card(page, accepted.user.name)
        .getByRole("button", { name: "Aceitar proposta" })
        .click();
      const dialog = page.getByRole("alertdialog", {
        name: `Aceitar a proposta de ${accepted.user.name}?`,
      });
      await expect(dialog).toContainText(
        "as solicitações ainda sem resposta ficam sem efeito. Esta ação não pode ser anulada.",
      );
      await dialog.getByRole("button", { name: "Confirmar" }).click();
      await expect(page.getByText("Proposta aceite.")).toBeVisible();
      // O estado ao lado do título, no cartão de cima
      await expect(
        page.getByRole("heading", { name: title, level: 1 }).locator(".."),
      ).toContainText("Atribuído");
      await expect(page.getByRole("button", { name: "Aceitar proposta" })).toHaveCount(0);
    });

    await test.step("4. A solicitação sem resposta", async () => {
      await expect(card(page, silent.user.name)).toContainText(
        `Ficou sem efeito quando aceitou a proposta de ${accepted.user.name}.`,
      );
    });

    await test.step("5. «Marcar como realizado» → «Marcar como realizado»", async () => {
      await page.getByRole("button", { name: "Marcar como realizado" }).click();
      const dialog = page.getByRole("alertdialog", {
        name: `Marcar o serviço «${title}» como realizado?`,
      });
      await dialog.getByRole("button", { name: "Marcar como realizado" }).click();
      await expect(page.getByText("Serviço marcado como realizado.")).toBeVisible();
      await expect(page.getByRole("button", { name: "Avaliar serviço" })).toBeVisible();
    });

    await test.step("6. «Avaliar serviço» → 5 estrelas e o comentário → submeter", async () => {
      await page.getByRole("button", { name: "Avaliar serviço" }).click();
      const dialog = page.getByRole("dialog", { name: "Avaliar serviço" });
      await dialog.getByRole("radio", { name: /^5 estrelas/ }).click();
      await expect(dialog).toContainText("Muito satisfeito");
      await dialog.getByLabel("Comentário").fill("Rápido e muito cuidadoso.");
      await dialog.getByRole("button", { name: "Submeter avaliação" }).click();
      await expect(page.getByText("Avaliação registada.")).toBeVisible();
      await expect(dialog).toHaveCount(0);
      for (const action of ["Avaliar serviço", "Marcar como realizado", "Cancelar serviço"]) {
        await expect(page.getByRole("button", { name: action })).toHaveCount(0);
      }
    });
  });
});
