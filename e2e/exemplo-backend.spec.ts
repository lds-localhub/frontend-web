// Teste de sistema de exemplo (I093): verifica o ambiente dos testes de sistema de ponta a ponta,
// isto é, o Google Chrome, o frontend, o backend real, a base de dados de referência criada pelos scripts e
// o geocodificador simulado. Serve de modelo aos testes de sistema das funcionalidades.

import { test, expect } from "./support/fixtures.ts";
import { definirLocalizacao, registarConta } from "./support/api.ts";

test("o frontend comunica com o backend real, a base de dados de referência e o geocodificador simulado", async ({
  page,
  api,
}) => {
  // Preparação dos dados pela API documentada (sem acesso direto à base de dados)
  const cliente = await registarConta(api, "CLIENT");
  const utilizador = await definirLocalizacao(
    api,
    cliente.token,
    "Rua de Santa Catarina 74, Porto",
  );
  expect(utilizador.address).toBe("Rua de Santa Catarina 74, Porto");

  // A aplicação abre no Google Chrome, com a viewport de 1920 × 1080 px (RNF-09)
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Pesquisar Prestadores" })).toBeVisible();
  expect(page.viewportSize()).toEqual({ width: 1920, height: 1080 });

  // Pedidos feitos pelo próprio navegador, através do frontend, ao backend real
  const respostas = await page.evaluate(async (token) => {
    const categorias = await fetch("/api/categories");
    const conta = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
    return {
      categorias: { estado: categorias.status, corpo: await categorias.json() },
      conta: { estado: conta.status, corpo: await conta.json() },
    };
  }, cliente.token);

  // Categorias da base de dados de referência (scripts do backend, RNF-19)
  expect(respostas.categorias.estado).toBe(200);
  expect(JSON.stringify(respostas.categorias.corpo)).toContain("Canalização");
  expect(JSON.stringify(respostas.categorias.corpo)).toContain("Eletricidade");

  // Conta criada pela API e localização convertida pelo geocodificador simulado
  expect(respostas.conta.estado).toBe(200);
  expect(respostas.conta.corpo).toMatchObject({
    email: cliente.email,
    role: "CLIENT",
    address: "Rua de Santa Catarina 74, Porto",
  });
});
