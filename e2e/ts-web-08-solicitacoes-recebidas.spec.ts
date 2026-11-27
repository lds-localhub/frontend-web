import type { Page } from "@playwright/test";
import { registerAndLogin } from "./fixtures/accounts.ts";
import { createProviderWithProfile } from "./fixtures/providers.ts";
import { createDirectRequestService } from "./fixtures/services.ts";
import { loginViaUi } from "./fixtures/session.ts";
import { expect, test } from "./fixtures/test.ts";

// TS-WEB-08 — Responder a solicitações diretas
//
// O Prestador é criado neste teste, por isso só tem as duas solicitações preparadas pela API. As
// listas estão ordenadas da mais recente para a mais antiga: a primeira é a do segundo serviço criado.

// Linha da tabela das solicitações com o serviço indicado
function row(page: Page, title: string) {
  return page.getByRole("row").filter({ hasText: title });
}

test.describe("TS-WEB-08 Responder a solicitações diretas", () => {
  test("apresentar proposta numa solicitação e recusar a outra", async ({ page, request }) => {
    const provider = await createProviderWithProfile(request);
    const client = await registerAndLogin(request, "CLIENT", "ts08");
    const older = "Pintar o quarto das traseiras";
    const newer = "Reparar fuga na torneira";
    await createDirectRequestService(request, client, [provider.professionalProfileId], {
      title: older,
    });
    await createDirectRequestService(request, client, [provider.professionalProfileId], {
      title: newer,
    });

    // Pedidos de apresentar proposta feitos pela aplicação, para provar que o valor inválido
    // não chega ao backend
    let proposalRequests = 0;
    page.on("request", (r) => {
      if (r.method() === "POST" && /\/api\/services\/\d+\/proposals$/.test(r.url())) {
        proposalRequests++;
      }
    });

    await test.step("1. Abrir o início do Prestador (W30)", async () => {
      await loginViaUi(page, provider.email, provider.password);
      await expect(page).toHaveURL(/\/prestador$/);
      await expect(page.getByRole("link", { name: /2 solicitações pendentes/ })).toBeVisible();
      await expect(row(page, newer)).toContainText("Pendente");
      await expect(row(page, older)).toContainText("Pendente");
      await expect(page.getByRole("row").nth(1)).toContainText(newer);
    });

    await test.step("2. «Responder» na primeira", async () => {
      await row(page, newer).getByRole("button", { name: "Responder" }).click();
      await expect(page).toHaveURL(/\/solicitacoes\/\d+$/);
      await expect(
        page.getByRole("heading", { name: `Solicitação de ${client.user.name}` }),
      ).toBeVisible();
      await expect(page.getByRole("heading", { name: "Apresentar proposta" })).toBeVisible();
    });

    await test.step("3. Valor 0 e as condições → «Enviar proposta»", async () => {
      await page.getByLabel("Valor (€)").fill("0");
      await page.getByLabel("Condições").fill("Inclui material e deslocação.");
      await page.getByRole("button", { name: "Enviar proposta" }).click();
      await expect(page.getByText("O valor tem de ser maior que 0.")).toBeVisible();
      expect(proposalRequests).toBe(0);
    });

    await test.step("4. Valor 80,00 → «Enviar proposta»", async () => {
      await page.getByLabel("Valor (€)").fill("80,00");
      await page.getByRole("button", { name: "Enviar proposta" }).click();
      await expect(page.getByText("Proposta enviada.")).toBeVisible();
      await expect(page.getByText("Proposta apresentada", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Ver proposta" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Apresentar proposta" })).toHaveCount(0);
      expect(proposalRequests).toBe(1);
    });

    await test.step("5. Voltar ao início (W30)", async () => {
      await page.getByRole("link", { name: "LocalHub" }).click();
      await expect(page).toHaveURL(/\/prestador$/);
      await expect(page.getByRole("link", { name: /1 solicitação pendente/ })).toBeVisible();
      await expect(row(page, older)).toContainText("Pendente");
      await expect(row(page, newer)).toHaveCount(0);
    });

    await test.step("6. «Solicitações recebidas» no cabeçalho", async () => {
      await page
        .getByRole("navigation", { name: "Principal" })
        .getByRole("link", { name: "Solicitações recebidas" })
        .click();
      await expect(page).toHaveURL(/\/solicitacoes$/);
      await expect(page.getByRole("combobox", { name: "Estado" })).toHaveText(/Todos/);
      await expect(row(page, newer)).toContainText("Proposta apresentada");
      await expect(row(page, newer).getByRole("button", { name: "Ver proposta" })).toBeVisible();
      await expect(row(page, older)).toContainText("Pendente");
      await expect(row(page, older).getByRole("button", { name: "Responder" })).toBeVisible();
    });

    await test.step("7. «Responder» na segunda → «Recusar solicitação» → janela «Recusar a solicitação de <Cliente>?» → «Recusar»", async () => {
      await row(page, older).getByRole("button", { name: "Responder" }).click();
      await page.getByRole("button", { name: "Recusar solicitação" }).click();
      const dialog = page.getByRole("alertdialog", {
        name: `Recusar a solicitação de ${client.user.name}?`,
      });
      await expect(dialog).toBeVisible();
      await dialog.getByRole("button", { name: "Recusar" }).click();
      await expect(page.getByText("Solicitação recusada.")).toBeVisible();
      await expect(page.getByText("Recusada", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Recusar solicitação" })).toHaveCount(0);
    });
  });
});
