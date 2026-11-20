import { registerAndLogin } from "./fixtures/accounts.ts";
import { ADDRESS_NOT_FOUND, address, UNKNOWN_ADDRESS } from "./fixtures/addresses.ts";
import { loginViaUi } from "./fixtures/session.ts";
import { expect, test } from "./fixtures/test.ts";

// TS-WEB-05 — Criar, consultar e editar o perfil profissional
// (RF-F004-01, RF-F004-02, RF-F004-03, RF-F004-04, RF-F015-01; RNF-08)

test.describe("TS-WEB-05 Criar, consultar e editar o perfil profissional", () => {
  test("criar o perfil, consultá-lo e acrescentar uma categoria", async ({ page, request }) => {
    const provider = await registerAndLogin(request, "PROVIDER", "ts05");
    const introduction = "Canalizador com equipa própria na área do Grande Porto.";

    // Pedidos de criação (E12) e de edição (E14) do perfil feitos pela aplicação, para provar que a
    // validação não os envia
    let createRequests = 0;
    let editRequests = 0;
    page.on("request", (r) => {
      const path = new URL(r.url()).pathname;
      if (r.method() === "POST" && path === "/api/profiles") {
        createRequests++;
      }
      if (r.method() === "PUT" && path === "/api/profiles/me") {
        editRequests++;
      }
    });

    const introductionField = page.getByLabel("Apresentação");
    const contactsField = page.getByLabel("Contactos");
    const experienceField = page.getByLabel("Experiência profissional");
    const addressField = page.getByLabel("Morada");
    const radiusField = page.getByLabel("Raio de atuação (km)");
    const plumbing = page.getByRole("checkbox", { name: "Canalização" });
    const electricity = page.getByRole("checkbox", { name: "Eletricidade" });
    const create = page.getByRole("button", { name: "Criar perfil" });

    await test.step("1. Iniciar sessão como o Prestador", async () => {
      await loginViaUi(page, provider.email, provider.password);
      await expect(page).toHaveURL(/\/perfil\/criar$/);
      await expect(
        page.getByText(
          "Para aceder às funcionalidades de Prestador (solicitações, pesquisa de trabalhos, propostas e relatório), crie primeiro o seu perfil profissional.",
        ),
      ).toBeVisible();
    });

    await test.step("2. Carregar em «Criar perfil» com o formulário vazio", async () => {
      await create.click();
      await expect(page.getByText("Indique a apresentação.")).toBeVisible();
      await expect(page.getByText("Indique os contactos.")).toBeVisible();
      await expect(page.getByText("Indique pelo menos uma categoria de serviços.")).toBeVisible();
      await expect(page.getByText("Indique a experiência.")).toBeVisible();
      await expect(page.getByText("Indique a morada.")).toBeVisible();
      await expect(page.getByText("Indique o raio de atuação.")).toBeVisible();
      expect(createRequests).toBe(0);
    });

    await test.step("3. Preencher todos os campos com o raio 101 e a morada desconhecida → «Criar perfil»", async () => {
      await introductionField.fill(introduction);
      await contactsField.fill("Telefone 220 000 000");
      await experienceField.fill("15 anos em reparação de fugas e instalação de sanitários.");
      await plumbing.click();
      await addressField.fill(UNKNOWN_ADDRESS);
      await radiusField.fill("101");
      await create.click();
      // O raio fora de 1 a 100 km é recusado pela aplicação, sem pedido ao backend
      await expect(
        page.getByText("O raio de atuação tem de estar entre 1 e 100 km."),
      ).toBeVisible();
      expect(createRequests).toBe(0);

      // Com o raio válido, a morada desconhecida é recusada pelo backend (400 com errors.address)
      await radiusField.fill("25");
      await create.click();
      await expect(page.getByText(ADDRESS_NOT_FOUND)).toBeVisible();
      await expect(page).toHaveURL(/\/perfil\/criar$/);
    });

    await test.step("4. Corrigir o raio para 25 e a morada para a da Maia → «Criar perfil»", async () => {
      await addressField.fill(address("maia"));
      await create.click();
      await expect(page).toHaveURL(/\/prestador$/);
      await expect(page.getByText("Perfil criado.")).toBeVisible();
    });

    await test.step("5. Abrir o menu da conta → «O meu perfil»", async () => {
      await page.getByRole("button", { name: /Menu da conta/ }).click();
      await page.getByRole("menuitem", { name: "O meu perfil" }).click();
      await expect(page).toHaveURL(/\/perfil$/);
      await expect(page.getByText(introduction)).toBeVisible();
      await expect(page.getByText("Canalização", { exact: true })).toBeVisible();
      await expect(page.getByText(address("maia"))).toBeVisible();
      await expect(page.getByText("Raio de atuação: 25 km")).toBeVisible();
    });

    await test.step("6. «Editar perfil» → desmarcar «Canalização», a única categoria → guardar", async () => {
      await page.getByRole("button", { name: "Editar perfil" }).click();
      await expect(page).toHaveURL(/\/perfil\/editar$/);
      await expect(plumbing).toBeChecked();
      await plumbing.click();
      await page.getByRole("button", { name: "Guardar" }).click();
      // A remoção da única categoria é recusada pela aplicação, sem pedido ao backend (RF-F004-04)
      await expect(page.getByText("Indique pelo menos uma categoria de serviços.")).toBeVisible();
      expect(editRequests).toBe(0);
      await expect(page).toHaveURL(/\/perfil\/editar$/);
    });

    await test.step("7. Voltar a marcar «Canalização» e acrescentar «Eletricidade» → guardar", async () => {
      await plumbing.click();
      await electricity.click();
      await page.getByRole("button", { name: "Guardar" }).click();
      await expect(page).toHaveURL(/\/perfil$/);
      await expect(page.getByText("Perfil atualizado.")).toBeVisible();
      await expect(page.getByText("Canalização", { exact: true })).toBeVisible();
      await expect(page.getByText("Eletricidade", { exact: true })).toBeVisible();
    });
  });
});
