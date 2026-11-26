import type { Page } from "@playwright/test";
import { registerAndLogin } from "./fixtures/accounts.ts";
import { createProviderWithProfile } from "./fixtures/providers.ts";
import { createPublicService, submitProposal } from "./fixtures/services.ts";
import { loginViaUi } from "./fixtures/session.ts";
import { expect, test } from "./fixtures/test.ts";

// TS-WEB-11 — Ciclo de um trabalho publicado (RF-F008-01, RF-F008-03, RF-F008-02, RF-F008-05)

// Cartão da proposta do Prestador indicado, no detalhe do serviço
function card(page: Page, providerName: string) {
  return page.getByRole("article").filter({ hasText: providerName });
}

test.describe("TS-WEB-11 Ciclo de um trabalho publicado", () => {
  test("recusar e aceitar propostas e marcar como realizado", async ({ page, request }) => {
    const declined = await createProviderWithProfile(request);
    const accepted = await createProviderWithProfile(request);
    const client = await registerAndLogin(request, "CLIENT", "ts11");
    const title = "Desentupir a canalização da cozinha";
    const serviceId = await createPublicService(request, client, { title });
    await submitProposal(request, declined, serviceId, 120);
    await submitProposal(request, accepted, serviceId, 95);

    await test.step("1. No W10, «Ver todos ›»", async () => {
      await loginViaUi(page, client.email, client.password);
      await expect(page).toHaveURL(/\/cliente$/);
      await page.getByRole("link", { name: "Ver todos ›" }).click();
      await expect(page).toHaveURL(/\/servicos$/);
      await expect(page.getByRole("row").filter({ hasText: title })).toContainText(
        "Aberto a propostas",
      );
    });

    await test.step("2. «Abrir» o serviço", async () => {
      await page
        .getByRole("row")
        .filter({ hasText: title })
        .getByRole("button", { name: "Abrir" })
        .click();
      await expect(page).toHaveURL(new RegExp(`/servicos/${serviceId}$`));
      await expect(page.getByRole("heading", { name: "Propostas (2)" })).toBeVisible();
      await expect(card(page, declined.user.name)).toContainText("Pendente");
      await expect(card(page, accepted.user.name)).toContainText("Pendente");
    });

    await test.step("3. «Recusar proposta» numa → «Recusar»", async () => {
      await card(page, declined.user.name)
        .getByRole("button", { name: "Recusar proposta" })
        .click();
      await page
        .getByRole("alertdialog", { name: `Recusar a proposta de ${declined.user.name}?` })
        .getByRole("button", { name: "Recusar" })
        .click();
      await expect(page.getByText("Proposta recusada.")).toBeVisible();
      await expect(card(page, declined.user.name)).toContainText("Recusada");
    });

    await test.step("4. «Aceitar proposta» na outra → «Confirmar»", async () => {
      await card(page, accepted.user.name)
        .getByRole("button", { name: "Aceitar proposta" })
        .click();
      await page
        .getByRole("alertdialog", { name: `Aceitar a proposta de ${accepted.user.name}?` })
        .getByRole("button", { name: "Confirmar" })
        .click();
      await expect(page.getByText("Proposta aceite.")).toBeVisible();
      // O estado ao lado do título, no cartão de cima
      await expect(
        page.getByRole("heading", { name: title, level: 1 }).locator(".."),
      ).toContainText("Atribuído");
    });

    await test.step("5. «Marcar como realizado» → «Marcar como realizado»", async () => {
      await page.getByRole("button", { name: "Marcar como realizado" }).click();
      await page
        .getByRole("alertdialog", { name: `Marcar o serviço «${title}» como realizado?` })
        .getByRole("button", { name: "Marcar como realizado" })
        .click();
      await expect(page.getByText("Serviço marcado como realizado.")).toBeVisible();
      await expect(page.getByRole("button", { name: "Avaliar serviço" })).toBeVisible();
    });
  });
});
