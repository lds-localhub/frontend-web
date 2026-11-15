// Preparação dos dados de teste através da API documentada do backend (RNF-12).
//
// Os testes de sistema não acedem diretamente à base de dados. A base de referência é criada e reposta
// pelos scripts do backend (RNF-19) e é só de leitura para os testes; cada teste cria pela API os dados
// de que precisa, com e-mails únicos, para que os testes sejam independentes uns dos outros.

import { randomUUID } from "node:crypto";
import { expect, type APIRequestContext } from "@playwright/test";

// Endereço do backend real (o mesmo para onde o proxy do Vite encaminha os pedidos a /api)
export const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5041";

// Palavra-passe das contas criadas pelos testes (cumpre a regra do registo: 8 caracteres, letra e algarismo)
export const PALAVRA_PASSE_TESTE = "Teste2026";

// Contas da base de dados de referência (README dos scripts da base de dados do backend).
// As palavras-passe não ficam no repositório: são lidas das variáveis de ambiente (GitHub Secrets no CI).
export const CONTAS_REFERENCIA = {
  administrador: { email: "ana.almeida@localhub.test", variavel: "E2E_ADMIN_PASSWORD" },
  cliente: { email: "carla.costa@localhub.test", variavel: "E2E_DEMO_PASSWORD" },
  prestador: { email: "hugo.henriques@localhub.test", variavel: "E2E_DEMO_PASSWORD" },
} as const;

export type Papel = "CLIENT" | "PROVIDER";

export interface Conta {
  userId: number;
  name: string;
  email: string;
  password: string;
  role: string;
  token: string;
}

export interface Utilizador {
  userId: number;
  name: string;
  email: string;
  role: string;
  address: string | null;
  professionalProfileId: number | null;
}

// E-mail fictício e único (domínio reservado .test, RNF-20)
export function emailUnico(prefixo = "teste"): string {
  return `${prefixo}.${Date.now()}.${randomUUID().slice(0, 8)}@localhub.test`;
}

function autenticacao(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

// POST /api/auth/login (aplicação WEB); devolve o token da sessão
export async function iniciarSessao(
  api: APIRequestContext,
  email: string,
  password: string,
): Promise<string> {
  const resposta = await api.post("/api/auth/login", { data: { email, password, client: "WEB" } });
  expect(resposta.status(), `Início de sessão de ${email}`).toBe(200);
  const corpo = (await resposta.json()) as { token: string };
  return corpo.token;
}

// Inicia sessão com uma conta da base de dados de referência
export async function iniciarSessaoReferencia(
  api: APIRequestContext,
  conta: keyof typeof CONTAS_REFERENCIA,
): Promise<string> {
  const { email, variavel } = CONTAS_REFERENCIA[conta];
  const password = process.env[variavel];
  if (!password) {
    throw new Error(`Defina a variável de ambiente ${variavel} com a palavra-passe de ${email}.`);
  }
  return iniciarSessao(api, email, password);
}

// POST /api/auth/register e início de sessão; devolve a conta com o token
export async function registarConta(
  api: APIRequestContext,
  papel: Papel,
  dados: { name?: string; email?: string; password?: string } = {},
): Promise<Conta> {
  const name = dados.name ?? (papel === "CLIENT" ? "Cliente de Teste" : "Prestador de Teste");
  const email = dados.email ?? emailUnico(papel === "CLIENT" ? "cliente" : "prestador");
  const password = dados.password ?? PALAVRA_PASSE_TESTE;

  const resposta = await api.post("/api/auth/register", {
    data: { name, email, password, role: papel },
  });
  expect(resposta.status(), `Registo de ${email}`).toBe(201);

  const token = await iniciarSessao(api, email, password);
  const utilizador = await obterUtilizador(api, token);
  return { userId: utilizador.userId, name, email, password, role: utilizador.role, token };
}

// GET /api/auth/me
export async function obterUtilizador(api: APIRequestContext, token: string): Promise<Utilizador> {
  const resposta = await api.get("/api/auth/me", { headers: autenticacao(token) });
  expect(resposta.status(), "Consulta da conta com sessão iniciada").toBe(200);
  return (await resposta.json()) as Utilizador;
}

// PUT /api/users/me/location (só Cliente). A morada é convertida pelo geocodificador simulado.
export async function definirLocalizacao(
  api: APIRequestContext,
  token: string,
  morada: string,
): Promise<Utilizador> {
  const resposta = await api.put("/api/users/me/location", {
    headers: autenticacao(token),
    data: { address: morada },
  });
  expect(resposta.status(), `Definição da localização "${morada}"`).toBe(200);
  return (await resposta.json()) as Utilizador;
}
