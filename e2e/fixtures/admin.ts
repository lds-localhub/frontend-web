import type { APIRequestContext } from "@playwright/test";
import { failIfNot, login } from "./accounts.ts";

// Administrador dos dados de referência (README dos scripts da base de dados do backend).
// A palavra-passe não fica no repositório: é lida da variável E2E_ADMIN_PASSWORD (GitHub Secrets no CI).
export const ADMIN_EMAIL = "ana.almeida@localhub.test";

export function adminPassword(): string {
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!password) {
    throw new Error(
      `Defina a variável de ambiente E2E_ADMIN_PASSWORD (palavra-passe de ${ADMIN_EMAIL}).`,
    );
  }
  return password;
}

// E02: sessão do Administrador (aplicação web); devolve o token
export async function loginAsAdmin(request: APIRequestContext): Promise<string> {
  const { token } = await login(request, ADMIN_EMAIL, adminPassword());
  return token;
}

// E06: desativa uma conta de Cliente ou de Prestador
export async function deactivateAccount(
  request: APIRequestContext,
  adminToken: string,
  userId: number,
): Promise<void> {
  const response = await request.post(`/api/accounts/${userId}/deactivate`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  await failIfNot(response, 200);
}

// Nome único de categoria (até 60 caracteres): a base de dados só é reposta uma vez por execução
export function uniqueCategoryName(prefix: string): string {
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${prefix} ${Date.now()}${suffix}`.slice(0, 60);
}
