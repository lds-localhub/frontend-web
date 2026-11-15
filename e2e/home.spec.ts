import { test, expect } from "@playwright/test";

test("a página inicial abre a pesquisa de Prestadores", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/pesquisa\/prestadores$/);
  await expect(page).toHaveTitle(/LocalHub/);
  await expect(page.getByRole("link", { name: "Iniciar sessão" })).toBeVisible();
});

test("uma rota protegida sem sessão vai para o início de sessão", async ({ page }) => {
  await page.goto("/conta/palavra-passe");
  await expect(page).toHaveURL(/\/login$/);
});

test("uma rota inexistente mostra a página de erro", async ({ page }) => {
  await page.goto("/rota-que-nao-existe");
  await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
});
