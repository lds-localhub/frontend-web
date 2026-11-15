// Antes dos testes de sistema: confirma que o backend real está a responder, para que uma falha do
// ambiente apareça com uma mensagem clara e não como uma falha de cada teste.

import { BACKEND_URL } from "./api.ts";

export default async function globalSetup(): Promise<void> {
  try {
    const resposta = await fetch(`${BACKEND_URL}/api/health`);
    if (!resposta.ok) {
      throw new Error(`HTTP ${resposta.status}`);
    }
  } catch (erro) {
    throw new Error(
      `O backend não está disponível em ${BACKEND_URL}/api/health (${String(erro)}). ` +
        "Arranque o backend com a base de dados de teste e o geocodificador simulado (README, secção Testes de sistema).",
      { cause: erro },
    );
  }
}
