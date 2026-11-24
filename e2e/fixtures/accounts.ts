import type { APIRequestContext, APIResponse } from "@playwright/test";

// Preparação de contas pela API documentada (E01, E02), sem acesso direto à base de dados.
// Os pedidos vão para /api no servidor do Vite, que os reencaminha para o backend.

export type Role = "CLIENT" | "PROVIDER";

export interface SessionUser {
  userId: number;
  name: string;
  email: string;
  role: Role | "ADMIN";
  address: string | null;
  professionalProfileId: number | null;
}

export interface TestAccount {
  email: string;
  password: string;
  token: string;
  user: SessionUser;
}

// Palavra-passe fictícia das contas criadas pelos testes (regra do E01: 8+ caracteres, letra e algarismo)
export const TEST_PASSWORD = "Teste2026";

// Identificador único por conta: <instante><sufixo aleatório>
export function uniqueId(): string {
  return `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
}

// E-mail único por teste: <prefixo>.<identificador>@localhub.test
export function uniqueEmail(prefix: string, id: string = uniqueId()): string {
  return `${prefix}.${id}@localhub.test`;
}

export async function failIfNot(response: APIResponse, status: number) {
  if (response.status() !== status) {
    throw new Error(
      `${response.url()} devolveu ${response.status()} (esperado ${status}): ${await response.text()}`,
    );
  }
}

// E02: inicia sessão como a aplicação web (client = WEB) e devolve o token e o utilizador
export async function login(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<{ token: string; user: SessionUser }> {
  const response = await request.post("/api/auth/login", {
    data: { email, password, client: "WEB" },
  });
  await failIfNot(response, 200);
  return response.json();
}

// E01 + E02: regista uma conta nova com um e-mail único e inicia sessão com ela
export async function registerAndLogin(
  request: APIRequestContext,
  role: Role,
  prefix: string = role === "CLIENT" ? "cliente" : "prestador",
  name?: string,
): Promise<TestAccount> {
  // O nome também é único: a BD só é reposta uma vez por execução e os dados dos testes acumulam-se,
  // por isso um teste identifica as suas contas pelo nome (ex.: filtro name da pesquisa E18)
  const id = uniqueId();
  const email = uniqueEmail(prefix, id);
  name ??= `${role === "CLIENT" ? "Cliente" : "Prestador"} ${id}`;

  const response = await request.post("/api/auth/register", {
    data: { name, email, password: TEST_PASSWORD, role },
  });
  await failIfNot(response, 201);

  const session = await login(request, email, TEST_PASSWORD);
  return { email, password: TEST_PASSWORD, ...session };
}

// E16: define a localização registada da conta (morada conhecida pelo stub do Nominatim)
export async function setLocation(
  request: APIRequestContext,
  account: TestAccount,
  address: string,
): Promise<void> {
  const response = await request.put("/api/users/me/location", {
    headers: { Authorization: `Bearer ${account.token}` },
    data: { address },
  });
  await failIfNot(response, 200);
}
