import { registerAndLogin } from "./fixtures/accounts.ts";
import { todayUtc } from "./fixtures/dates.ts";
import { loginViaUi, logoutViaUi } from "./fixtures/session.ts";
import { expect, test } from "./fixtures/test.ts";

// TS-WEB-17 — Rede indisponível antes do pedido e durante a operação (RNF-23)
// Cada página é aberta com rede, porque sem rede o browser não carrega a aplicação. Só se simula a
// falha de rede: o backend continua a ser o real.

const NETWORK_MESSAGE = "Não foi possível contactar o servidor. Tente novamente.";

test.describe("TS-WEB-17 Rede indisponível", () => {
  test("consulta e alteração sem rede, sem envio posterior", async ({ page, context, request }) => {
    const client = await registerAndLogin(request, "CLIENT", "ts17");
    const networkMessage = page.getByText(NETWORK_MESSAGE);
    const success = page.getByText("Palavra-passe alterada.");
    const save = page.getByRole("button", { name: "Guardar" });

    await test.step("1. Antes do pedido, consulta: relatório (W20) sem rede → «Aplicar»", async () => {
      await loginViaUi(page, client.email, client.password);
      await expect(page).toHaveURL(/\/cliente$/);
      await page.getByRole("link", { name: "Relatório", exact: true }).click();
      await expect(page.getByText("Sem atividade no período escolhido.")).toBeVisible();

      await context.setOffline(true);
      await page.getByLabel("Data inicial").fill(todayUtc());
      await page.getByRole("button", { name: "Aplicar" }).click();
      // As leituras ainda tentam mais duas vezes antes de mostrar o erro
      await expect(networkMessage).toBeVisible({ timeout: 15_000 });
    });

    await test.step("2. Antes do pedido, alteração: alterar a palavra-passe (W23) sem rede", async () => {
      await context.setOffline(false);
      await page.getByTestId("menu-conta").click();
      await page.getByRole("menuitem", { name: "Alterar palavra-passe" }).click();
      await expect(page).toHaveURL(/\/conta\/palavra-passe$/);

      await context.setOffline(true);
      await page.getByLabel("Palavra-passe atual").fill(client.password);
      await page.getByLabel("Nova palavra-passe", { exact: true }).fill("Nova2027ab");
      await page.getByLabel("Confirmar nova palavra-passe").fill("Nova2027ab");
      await save.click();
      await expect(networkMessage).toBeVisible();
      await expect(success).toBeHidden();
      // A mensagem desaparece sozinha; o passo seguinte espera pela sua própria mensagem
      await expect(networkMessage).toBeHidden({ timeout: 15_000 });
    });

    await test.step("3. Durante a operação, alteração: a ligação cai durante o pedido", async () => {
      await context.setOffline(false);
      // O pedido sai da aplicação e é cortado antes de chegar ao backend
      await page.route("**/api/users/me/password", (route) => route.abort("internetdisconnected"));
      await save.click();
      await expect(networkMessage).toBeVisible();
      await expect(success).toBeHidden();
      await page.unroute("**/api/users/me/password");
    });

    await test.step("4. Sem envio posterior: terminar sessão e entrar com a palavra-passe antiga", async () => {
      await logoutViaUi(page);
      await expect(page).toHaveURL(/\/login$/);
      await loginViaUi(page, client.email, client.password);
      await expect(page).toHaveURL(/\/cliente$/);
    });
  });
});
