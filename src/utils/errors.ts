import { ApiError } from "@/api/client";
import type { LocalHubErrorType } from "@/api/types";

// Mensagem apresentada quando não há resposta do backend (sem rede ou servidor desligado, RNF-23)
export const UNAVAILABLE_MESSAGE = "Não foi possível contactar o servidor. Tente novamente.";

// Mensagem para mostrar ao utilizador, seja qual for o erro.
// O detail do Problem Details já vem em português e é apresentável ao utilizador (secção 4.6),
// por isso o 403, o 404, o 409 e o 503 não têm textos próprios no frontend.
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.detail; // mensagem do backend
  return UNAVAILABLE_MESSAGE; // sem resposta (rede)
}

// É um ApiError (e, opcionalmente, deste tipo próprio do LocalHub)?
export function isApiError(error: unknown, type?: LocalHubErrorType): error is ApiError {
  return error instanceof ApiError && (!type || error.type.endsWith(`/${type}`));
}

// Erros de campo de um 400 (errors), ou undefined (filtros das pesquisas, parte 8.5.3)
export function getFieldErrors(error: unknown): Record<string, string[]> | undefined {
  return isApiError(error) && error.status === 400 ? error.errors : undefined;
}
