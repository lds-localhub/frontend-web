import type { Page } from "@playwright/test";
import { registerAndLogin, setLocation } from "./fixtures/accounts.ts";
import { address } from "./fixtures/addresses.ts";
import { utcDay } from "./fixtures/dates.ts";
import { createProviderWithProfile } from "./fixtures/providers.ts";
import { loginViaUi } from "./fixtures/session.ts";
import { expect, test } from "./fixtures/test.ts";

// TS-WEB-06 — Pesquisar Prestadores e criar solicitações diretas
// (RF-F005-01, RF-F005-02, RF-F004-03, RF-F009-01 a RF-F009-03)
//
// Os Prestadores de cada caso ficam numa morada que nenhum outro teste usa (Aveiro, Braga) e a
// pesquisa é feita a partir dela: ficam a 0 km, no topo dos resultados.

// Resultado da pesquisa (cartão no W01, linha no W11) com o nome indicado
function result(page: Page, name: string) {
  return page.getByRole("article").filter({ has: page.getByRole("heading", { name }) });
}

async function chooseCategory(page: Page, name: string) {
  await page.getByRole("combobox", { name: "Categoria" }).click();
  await page.getByRole("option", { name }).click();
}

test.describe("TS-WEB-06 Pesquisar Prestadores e criar solicitações diretas", () => {
  test("caso 1: Visitante pesquisa por morada e é levado ao início de sessão", async ({
    page,
    request,
  }) => {
    const provider = await createProviderWithProfile(request, { addressKey: "aveiro" });

    // Pedidos da pesquisa (E18) feitos pela aplicação, para provar que sem morada não é feita
    let searchRequests = 0;
    page.on("request", (r) => {
      if (new URL(r.url()).pathname === "/api/search/providers") {
        searchRequests++;
      }
    });

    await test.step("1. Sem sessão, escolher a categoria e pesquisar sem morada", async () => {
      await page.goto("/pesquisa/prestadores");
      await chooseCategory(page, "Canalização");
      await page.getByRole("button", { name: "Pesquisar" }).click();
      // Texto A CONFIRMAR no plano de testes
      await expect(page.getByText("Indique um endereço para pesquisar.")).toBeVisible();
      expect(searchRequests).toBe(0);
    });

    await test.step("2. Escrever a morada de Aveiro → «Pesquisar»", async () => {
      await page.getByLabel("Localização de referência (obrigatória)").fill(address("aveiro"));
      await page.getByRole("button", { name: "Pesquisar" }).click();
      await expect(
        page.getByText(/encontrados?, do mais próximo para o mais distante$/),
      ).toBeVisible();
      await expect(result(page, provider.user.name)).toContainText("0,0 km");
      // Do mais próximo para o mais distante: o primeiro resultado está a 0 km
      await expect(page.getByRole("article").first()).toContainText("0,0 km");
    });

    await test.step("3. «Iniciar sessão para ver o perfil» no Prestador do teste", async () => {
      await result(page, provider.user.name)
        .getByRole("button", { name: "Iniciar sessão para ver o perfil" })
        .click();
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
    });
  });

  test("caso 2: Cliente pesquisa, abre o perfil e envia solicitações a dois Prestadores", async ({
    page,
    request,
  }) => {
    const first = await createProviderWithProfile(request, { addressKey: "braga" });
    const second = await createProviderWithProfile(request, { addressKey: "braga" });
    const client = await registerAndLogin(request, "CLIENT", "ts06");
    await setLocation(request, client, address("braga"));

    await test.step("1. Iniciar sessão e pesquisar Canalização a partir da localização registada", async () => {
      await loginViaUi(page, client.email, client.password);
      await expect(page).toHaveURL(/\/cliente$/);
      await page.getByRole("link", { name: "Pesquisar Prestadores" }).click();
      await chooseCategory(page, "Canalização");
      await page.getByRole("button", { name: "Pesquisar" }).click();
      await expect(result(page, first.user.name)).toContainText("0,0 km");
      await expect(result(page, second.user.name)).toBeVisible();
    });

    await test.step("2. «Ver perfil» no primeiro Prestador", async () => {
      await result(page, first.user.name).getByRole("button", { name: "Ver perfil" }).click();
      await expect(page).toHaveURL(new RegExp(`/prestadores/${first.professionalProfileId}$`));
      await expect(page.getByRole("heading", { name: first.user.name, level: 1 })).toBeVisible();
    });

    await test.step("3. «Fazer solicitação direta»: o Prestador já está selecionado", async () => {
      await page.getByRole("button", { name: "Fazer solicitação direta" }).click();
      // O Prestador vai no URL (RF-F009-03, regra 4)
      await expect(page).toHaveURL(new RegExp(`prestador=${first.professionalProfileId}`));
      await expect(
        page.getByText(`Pedido iniciado no perfil de ${first.user.name}, que já está na seleção.`),
      ).toBeVisible();
      await expect(page.getByRole("combobox", { name: "Categoria" })).toHaveText(/Canalização/);
    });

    await test.step("4. Preencher o serviço e juntar o segundo Prestador", async () => {
      await page.getByLabel("Título").fill("Reparar fuga na torneira");
      await page
        .getByLabel("Descrição do serviço")
        .fill("Torneira da cozinha com fuga de água junto à base.");
      await page.getByLabel("Data", { exact: true }).fill(utcDay(3));
      await page.getByLabel("Pesquisar por nome").fill(second.user.name);
      await page.getByRole("button", { name: `Selecionar ${second.user.name}` }).click();
      const selected = page.getByRole("list", { name: "Prestadores selecionados" });
      await expect(selected).toContainText(first.user.name);
      await expect(selected).toContainText(second.user.name);
    });

    await test.step("5. «Enviar solicitações (2)»", async () => {
      await page.getByRole("button", { name: "Enviar solicitações (2)" }).click();
      await expect(page.getByText("Serviço criado.")).toBeVisible();
      await expect(page).toHaveURL(/\/servicos\/\d+$/);
    });

    await test.step("6. Detalhe do serviço (W15): estado «Aberto» e os dois Prestadores", async () => {
      await expect(page.getByRole("heading", { name: "Reparar fuga na torneira" })).toBeVisible();
      await expect(page.getByText("Solicitações diretas", { exact: true })).toBeVisible();
      await expect(page.getByText("Aberto", { exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Solicitações (2)" })).toBeVisible();
      for (const provider of [first, second]) {
        const directRequest = page.getByRole("article").filter({ hasText: provider.user.name });
        await expect(directRequest).toContainText("Pendente");
        await expect(directRequest).toContainText("A aguardar resposta do Prestador.");
      }
    });
  });
});
