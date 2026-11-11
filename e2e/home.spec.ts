import { test, expect } from "@playwright/test";

test("a página inicial abre", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/LocalHub/);
});
