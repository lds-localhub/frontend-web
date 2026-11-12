import { queryClient } from "./queryClient";
import type { ProblemDetails } from "./types";

// Erro devolvido pelo backend (4xx/5xx), com os campos do Problem Details (secção 4.6).
// Os erros sem resposta (sem rede, servidor desligado) não são ApiError: chegam como o TypeError do fetch.
export class ApiError extends Error {
  status: number; // 400, 401, 403, 404, 409, 500, 503
  type: string; // ex.: 'https://localhub.local/erros/transicao-invalida'
  detail: string; // mensagem em português, apresentável ao utilizador
  errors?: Record<string, string[]>; // só nos 400: erros por campo

  constructor(status: number, type: string, detail: string, errors?: Record<string, string[]>) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.type = type;
    this.detail = detail;
    this.errors = errors;
  }
}

// URL base da API (secção 4.1). Por omissão, /api no mesmo servidor (em desenvolvimento, o proxy do Vite
// encaminha para o backend); pode ser alterado com a variável VITE_API_BASE_URL, sem alterar o código.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// Token da sessão (secção 4.2), guardado no browser até terminar a sessão.
const TOKEN_KEY = "token";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// Sessão expirada ou revogada: apaga o token e a cache e volta ao início de sessão.
// Fora do React (chamada pelo api()), por isso navega com window.location, que também recarrega a aplicação.
export function onUnauthorized() {
  clearToken();
  queryClient.clear();
  window.location.assign("/login");
}

// Único ponto de acesso ao backend: nenhum componente chama fetch diretamente.
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...init?.headers,
    },
  });

  if (res.status === 204) return undefined as T;
  if (res.ok) return res.json();

  // Corpo do erro (secção 4.6); Partial: pode não ser um Problem Details (ex.: 502 de um proxy sem JSON)
  const p: Partial<ProblemDetails> = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== "/auth/login") onUnauthorized();
  throw new ApiError(res.status, p.type ?? "", p.detail ?? "Ocorreu um erro inesperado.", p.errors);
}

// Monta os parâmetros de query (ex.: 'status=PENDING&page=1'); ignora os valores undefined.
export function toQueryString(
  params: Record<string, string | number | boolean | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  return search.toString();
}
