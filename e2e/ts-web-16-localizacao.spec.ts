import { registerAndLogin } from "./fixtures/accounts.ts";
import { address, UNKNOWN_ADDRESS } from "./fixtures/addresses.ts";
import { loginViaUi } from "./fixtures/session.ts";
import { expect, test } from "./fixtures/test.ts";

// TS-WEB-16 — Definir a localização do Cliente (RF-F015-02; RNF-08)

// Mensagem do backend (errors.address do 400) quando não converte a morada em coordenadas
const ADDRESS_NOT_FOUND = "Não foi possível encontrar esta morada. Confirme-a.";

test.describe("TS-WEB-16 Definir a localização do Cliente", () => {
  test("definir a localização e manter a anterior quando a morada não é reconhecida", async ({
    page,
    request,
  }) => {
    // O registo não pede morada: o Cliente começa sem localização registada
    const client = await registerAndLogin(request, "CLIENT", "ts16");
    const addressField = page.getByLabel("Endereço");
    const save = page.getByRole("button", { name: "Guardar" });

    const openMyLocation = async () => {
      await page.getByRole("button", { name: /Menu da conta/ }).click();
      await page.getByRole("menuitem", { name: "A minha localização" }).click();
      await expect(page).toHaveURL(/\/conta\/localizacao$/);
    };

    await test.step("1. Abrir o menu da conta → «A minha localização»", async () => {
      await loginViaUi(page, client.email, client.password);
      await expect(page).toHaveURL(/\/cliente$/);
      await openMyLocation();
      await expect(addressField).toHaveValue("");
    });

    await test.step("2. Escrever a morada de Vila Nova de Gaia → «Guardar»", async () => {
      await addressField.fill(address("gaia"));
      await save.click();
      await expect(page.getByText("Localização atualizada.")).toBeVisible();
      await expect(page).toHaveURL(/\/conta\/localizacao$/);
      await expect(addressField).toHaveValue(address("gaia"));
    });

    await test.step("3. Escrever a morada desconhecida → «Guardar»", async () => {
      await addressField.fill(UNKNOWN_ADDRESS);
      await save.click();
      await expect(page.getByText(ADDRESS_NOT_FOUND)).toBeVisible();
    });

    await test.step("4. Reabrir o W21", async () => {
      await page.goto("/cliente");
      await openMyLocation();
      await expect(addressField).toHaveValue(address("gaia"));
    });
  });
});
