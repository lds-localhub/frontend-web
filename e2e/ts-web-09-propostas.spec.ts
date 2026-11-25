import { registerAndLogin, setLocation, uniqueId } from "./fixtures/accounts.ts";
import { address } from "./fixtures/addresses.ts";
import { createProviderWithProfile } from "./fixtures/providers.ts";
import { createPublicService } from "./fixtures/services.ts";
import { loginViaUi } from "./fixtures/session.ts";
import { expect, test } from "./fixtures/test.ts";

// TS-WEB-09 — Pesquisar trabalhos e apresentar proposta (RF-F006-01, RF-F011-01, RF-F011-02,
// RF-F008-07)
//
// A pesquisa mostra os serviços abertos de todos os testes, por isso o serviço deste teste tem um
// título único e é procurado pelo título.

test.describe("TS-WEB-09 Pesquisar trabalhos e apresentar proposta", () => {
  test("encontrar o serviço, enviar a proposta e vê-la nas propostas", async ({
    page,
    request,
  }) => {
    // Prestador em «Canalização», na Maia, com raio de 25 km (a 9,6 km da Rua das Flores)
    const provider = await createProviderWithProfile(request, {
      addressKey: "maia",
      serviceRadiusKm: 25,
      categoryNames: ["Canalização"],
    });
    const client = await registerAndLogin(request, "CLIENT", "ts09");
    await setLocation(request, client, address("carla"));
    const title = `Desentupir o lava-loiça ${uniqueId()}`;
    await createPublicService(request, client, {
      title,
      categoryName: "Canalização",
      addressKey: "carla",
    });
    const today = new Intl.DateTimeFormat("pt-PT").format(new Date());

    const result = page.getByRole("article").filter({
      has: page.getByRole("heading", { name: title }),
    });

    await test.step("1. Abrir «Pesquisar serviços» (W36)", async () => {
      await loginViaUi(page, provider.email, provider.password);
      await expect(page).toHaveURL(/\/prestador$/);
      await page
        .getByRole("navigation", { name: "Principal" })
        .getByRole("link", { name: "Pesquisar serviços" })
        .click();
      await expect(page).toHaveURL(/\/pesquisa\/servicos$/);
      await expect(page.getByRole("heading", { name: "Serviços perto de si" })).toBeVisible();
      await expect(result).toContainText("9,6 km");
      await expect(result).toContainText(`Publicado a ${today}`);
    });

    await test.step("2. Abrir o serviço", async () => {
      await result.getByRole("button", { name: "Ver serviço" }).click();
      await expect(page).toHaveURL(/\/pesquisa\/servicos\/\d+$/);
      await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Apresentar proposta" })).toBeVisible();
    });

    await test.step("3. Preencher o valor e as condições → «Enviar proposta»", async () => {
      await page.getByLabel("Valor (€)").fill("120,00");
      await page.getByLabel("Condições").fill("Inclui material e deslocação.");
      await page.getByRole("button", { name: "Enviar proposta" }).click();
      await expect(page.getByText("Proposta enviada.")).toBeVisible();
      await expect(page.getByRole("heading", { name: "A sua proposta" })).toBeVisible();
      await expect(page.getByText(/120,00\s€/)).toBeVisible();
      await expect(page.getByText("Inclui material e deslocação.")).toBeVisible();
      await expect(page.getByText("A aguardar a decisão do Cliente.")).toBeVisible();
      await expect(page.getByRole("heading", { name: "Apresentar proposta" })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Cancelar serviço" })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Ver proposta" })).toHaveCount(0);
    });

    await test.step("4. Abrir «As minhas propostas» (W38)", async () => {
      await page
        .getByRole("navigation", { name: "Principal" })
        .getByRole("link", { name: "As minhas propostas" })
        .click();
      await expect(page).toHaveURL(/\/propostas$/);
      const row = page.getByRole("row").filter({ hasText: title });
      await expect(row).toContainText("Pendente");
      await expect(row).toContainText(/120,00\s€/);
    });
  });
});
