import type { Page } from "@playwright/test";

// Sessão no browser, pelos ecrãs da aplicação ou com um token já obtido pela API.

// Inicia sessão no ecrã de início de sessão (W03), como o utilizador faria
export async function loginViaUi(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Palavra-passe").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
}

// Termina a sessão no menu da conta do cabeçalho, como o utilizador faria
export async function logoutViaUi(page: Page): Promise<void> {
  await page.getByRole("button", { name: /Menu da conta/ }).click();
  await page.getByRole("menuitem", { name: "Terminar sessão" }).click();
}

// Abre a aplicação já com a sessão indicada: o token fica no localStorage antes de a página carregar,
// como depois de um início de sessão
export async function openWithSession(page: Page, token: string): Promise<void> {
  // Script em texto: corre no browser (os testes são compilados sem os tipos do DOM)
  await page.addInitScript({ content: `localStorage.setItem("token", ${JSON.stringify(token)});` });
}
