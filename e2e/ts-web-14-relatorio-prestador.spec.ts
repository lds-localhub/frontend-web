import type { Page } from "@playwright/test";
import { registerAndLogin } from "./fixtures/accounts.ts";
import { todayUtc, yesterdayUtc } from "./fixtures/dates.ts";
import { createProviderWithProfile } from "./fixtures/providers.ts";
import {
  completeService,
  createAssignedService,
  createDirectRequestService,
  declineProposal,
  reviewService,
  submitProposal,
} from "./fixtures/services.ts";
import { openWithSession } from "./fixtures/session.ts";
import { expect, test } from "./fixtures/test.ts";

// TS-WEB-14 — Relatório do prestador (RF-F014-01, RF-F014-02)

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// Mês atual em UTC, como o mês das avaliações no backend (ex.: «Novembro 2026»)
function currentMonthLabel(): string {
  const now = new Date();
  return `${MONTHS[now.getUTCMonth()]} ${now.getUTCFullYear()}`;
}

function stat(page: Page, label: string) {
  return page.getByRole("article").filter({ has: page.getByText(label, { exact: true }) });
}

test.describe("TS-WEB-14 Relatório do prestador", () => {
  test("indicadores, evolução da classificação e filtro por período", async ({ page, request }) => {
    const provider = await createProviderWithProfile(request);
    const client = await registerAndLogin(request, "CLIENT", "ts14");

    // Proposta de 80,00 € aceite num serviço realizado e avaliado com 5 estrelas
    const { serviceId } = await createAssignedService(request, client, provider, {
      title: "Serviço TS14 realizado",
      amount: 80,
    });
    await completeService(request, client, serviceId);
    await reviewService(request, client, serviceId, 5);

    // Proposta recusada pelo Cliente noutro serviço
    const otherServiceId = await createDirectRequestService(
      request,
      client,
      [provider.professionalProfileId],
      { title: "Serviço TS14 recusado" },
    );
    const declinedId = await submitProposal(request, provider, otherServiceId, 60);
    await declineProposal(request, client, declinedId);

    const today = todayUtc();
    const yesterday = yesterdayUtc();
    const startDate = page.getByLabel("Data inicial");
    const endDate = page.getByLabel("Data final");
    const apply = page.getByRole("button", { name: "Aplicar" });

    const expectAllActivity = async () => {
      await expect(stat(page, "Serviços realizados").getByText("1", { exact: true })).toBeVisible();
      await expect(
        stat(page, "Propostas aceites / recusadas").getByText("1 / 1", { exact: true }),
      ).toBeVisible();
      await expect(stat(page, "Valor das propostas aceites")).toContainText(/80,00\s€/);
      const monthRow = page.getByRole("row", { name: new RegExp(currentMonthLabel()) });
      await expect(monthRow).toContainText("1 avaliação");
      await expect(monthRow).toContainText("5,0");
    };

    await test.step("1. Abrir o relatório do Prestador (W39)", async () => {
      await openWithSession(page, provider.token);
      await page.goto("/prestador");
      await page.getByRole("link", { name: "Relatório", exact: true }).click();
      await expect(page).toHaveURL(/\/prestador\/relatorio$/);
      await expect(page.getByRole("heading", { name: "Relatório de atividade" })).toBeVisible();
      await expectAllActivity();
    });

    await test.step("2. Só a data inicial = hoje → «Aplicar»", async () => {
      await startDate.fill(today);
      await apply.click();
      await expect(page).toHaveURL(new RegExp(`\\?startDate=${today}$`));
      await expectAllActivity();
    });

    await test.step("3. Só a data final = ontem → «Aplicar»", async () => {
      await startDate.fill("");
      await endDate.fill(yesterday);
      await apply.click();
      await expect(page).toHaveURL(new RegExp(`\\?endDate=${yesterday}$`));
      await expect(page.getByText("Sem atividade no período escolhido.")).toBeVisible();
    });
  });
});
