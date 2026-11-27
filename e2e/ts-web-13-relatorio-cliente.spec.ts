import type { Page } from "@playwright/test";
import { registerAndLogin } from "./fixtures/accounts.ts";
import { todayUtc, yesterdayUtc } from "./fixtures/dates.ts";
import { createProviderWithProfile } from "./fixtures/providers.ts";
import { completeService, createAssignedService } from "./fixtures/services.ts";
import { openWithSession } from "./fixtures/session.ts";
import { expect, test } from "./fixtures/test.ts";

// TS-WEB-13 — Relatório do cliente

// Cartão do relatório com o título indicado (ex.: «Por categoria»)
function card(page: Page, title: string) {
  return page.locator("section").filter({ has: page.getByRole("heading", { name: title }) });
}

test.describe("TS-WEB-13 Relatório do cliente", () => {
  test("toda a atividade, filtro por período e datas trocadas", async ({ page, request }) => {
    const provider = await createProviderWithProfile(request);
    const client = await registerAndLogin(request, "CLIENT", "ts13");
    const { serviceId } = await createAssignedService(request, client, provider, {
      title: "Serviço TS13",
      categoryName: "Canalização",
      amount: 80,
    });
    await completeService(request, client, serviceId);

    const today = todayUtc();
    const yesterday = yesterdayUtc();
    const startDate = page.getByLabel("Data inicial");
    const endDate = page.getByLabel("Data final");
    const apply = page.getByRole("button", { name: "Aplicar" });

    const expectAllActivity = async () => {
      await expect(
        page.getByRole("article", { name: "Serviços contratados" }).getByText("1", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("article", { name: "Valor das propostas aceites" }),
      ).toContainText(/80,00\s€/);
      await expect(card(page, "Por categoria").getByRole("listitem")).toHaveText([
        /^Canalização\s*1$/,
      ]);
      await expect(
        card(page, "Por estado").getByRole("listitem").filter({ hasText: "Realizado" }),
      ).toHaveText(/^Realizado\s*1$/);
      const historyRow = page.getByRole("row", { name: new RegExp(provider.user.name) });
      await expect(historyRow).toContainText("Canalização");
      await expect(historyRow).toContainText(/80,00\s€/);
    };

    await test.step("1. Abrir o relatório do Cliente (W20)", async () => {
      await openWithSession(page, client.token);
      await page.goto("/cliente");
      await page.getByRole("link", { name: "Relatório", exact: true }).click();
      await expect(page).toHaveURL(/\/cliente\/relatorio$/);
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

    await test.step("4. Data inicial = hoje e data final = ontem → «Aplicar»", async () => {
      const urlBefore = page.url();
      let reportRequests = 0;
      page.on("request", (r) => {
        if (r.url().includes("/api/reports/client")) {
          reportRequests++;
        }
      });

      await startDate.fill(today);
      await endDate.fill(yesterday);
      await apply.click();

      await expect(endDate).toHaveAccessibleDescription(
        "A data final não pode ser anterior à data inicial.",
      );
      await expect(page.getByText("Sem atividade no período escolhido.")).toBeVisible();
      expect(page.url()).toBe(urlBefore);
      expect(reportRequests).toBe(0);
    });
  });
});
