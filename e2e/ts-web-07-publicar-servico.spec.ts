import { registerAndLogin, setLocation } from "./fixtures/accounts.ts";
import { address } from "./fixtures/addresses.ts";
import { utcDay } from "./fixtures/dates.ts";
import { loginViaUi } from "./fixtures/session.ts";
import { expect, test } from "./fixtures/test.ts";

// TS-WEB-07 — Publicar trabalho (RF-F010-01)

test.describe("TS-WEB-07 Publicar trabalho", () => {
  test("publicar um serviço aberto a propostas e consultá-lo", async ({ page, request }) => {
    const client = await registerAndLogin(request, "CLIENT", "ts07");
    await setLocation(request, client, address("carla"));
    const title = "Pintar sala de 20 m²";

    await test.step("1. Iniciar sessão e abrir «Criar serviço»", async () => {
      await loginViaUi(page, client.email, client.password);
      await expect(page).toHaveURL(/\/cliente$/);
      await page.getByRole("link", { name: "Criar serviço" }).click();
      await expect(page).toHaveURL(/\/servicos\/novo$/);
      // Aberto a propostas por omissão; o local é a localização registada (RF-F009-01, regra 3)
      await expect(page.getByRole("button", { name: "Publicar serviço" })).toBeVisible();
      await expect(page.getByLabel("Local de realização")).toHaveValue(address("carla"));
    });

    await test.step("2. Preencher o serviço → «Publicar serviço»", async () => {
      await page.getByRole("combobox", { name: "Categoria" }).click();
      await page.getByRole("option", { name: "Canalização" }).click();
      await page.getByLabel("Título").fill(title);
      await page.getByLabel("Descrição do serviço").fill("Pintura das paredes e do teto da sala.");
      await page.getByLabel("Data", { exact: true }).fill(utcDay(3));
      await page.getByRole("button", { name: "Publicar serviço" }).click();
      await expect(page.getByText("Serviço criado.")).toBeVisible();
      await expect(page).toHaveURL(/\/servicos\/\d+$/);
    });

    await test.step("3. Detalhe do serviço (W18): aberto a propostas, estado «Aberto», sem propostas", async () => {
      await expect(page.getByRole("heading", { name: title })).toBeVisible();
      await expect(page.getByText("Aberto a propostas", { exact: true })).toBeVisible();
      await expect(page.getByText("Aberto", { exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Propostas (0)" })).toBeVisible();
      await expect(page.getByText("Ainda não recebeu propostas.")).toBeVisible();
    });
  });
});
