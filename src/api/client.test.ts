import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, api, clearToken, getToken, setToken, toQueryString } from "./client";
import { queryClient } from "./queryClient";
import type { Page } from "./types";

// Armazenamento em memória no lugar do localStorage do browser
function createStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, value),
  };
}

function jsonResponse(status: number, body: unknown, contentType = "application/json") {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": contentType } });
}

const fetchMock = vi.fn<typeof fetch>();
const assignMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  assignMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("localStorage", createStorage());
  vi.stubGlobal("window", { location: { assign: assignMock } });
});

function lastRequest() {
  const [url, init] = fetchMock.mock.calls.at(-1)!;
  return { url, headers: new Headers(init?.headers), init };
}

describe("api: pedidos", () => {
  it("usa o URL base configurado (/api por omissão) antes do caminho", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { total: 0, items: [] }));
    await api("/categories");
    expect(lastRequest().url).toBe("/api/categories");
  });

  it("envia o token no cabeçalho Authorization quando existe sessão", async () => {
    setToken("abc.def.ghi");
    fetchMock.mockResolvedValue(jsonResponse(200, {}));
    await api("/auth/me");
    expect(lastRequest().headers.get("Authorization")).toBe("Bearer abc.def.ghi");
  });

  it("não envia Authorization sem sessão (endpoints públicos)", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, {}));
    await api("/search/providers?serviceCategoryId=3");
    expect(lastRequest().headers.has("Authorization")).toBe(false);
  });

  it("envia JSON com o método e o corpo indicados", async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { proposalId: 540 }));
    await api("/services/301/proposals", {
      method: "POST",
      body: JSON.stringify({ amount: 80, conditions: "Inclui material." }),
    });
    const { init, headers } = lastRequest();
    expect(init?.method).toBe("POST");
    expect(init?.body).toBe('{"amount":80,"conditions":"Inclui material."}');
    expect(headers.get("Content-Type")).toBe("application/json");
  });
});

describe("api: respostas de sucesso", () => {
  it("devolve uma lista paginada com page, pageSize, total e items", async () => {
    const body: Page<{ serviceId: number }> = {
      page: 2,
      pageSize: 20,
      total: 57,
      items: [{ serviceId: 301 }],
    };
    fetchMock.mockResolvedValue(jsonResponse(200, body));
    const page = await api<Page<{ serviceId: number }>>("/services?page=2");
    expect(page).toEqual(body);
  });

  it("devolve undefined num 204, sem ler o corpo (E03, E40)", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(api<void>("/auth/logout", { method: "POST" })).resolves.toBeUndefined();
  });
});

describe("api: erros Problem Details", () => {
  it("400: lança ApiError com os erros por campo (errors) e a mensagem global (detail)", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        400,
        {
          type: "https://tools.ietf.org/html/rfc9110#section-15.5.1",
          title: "Dados inválidos",
          status: 400,
          detail: "Corrija os campos assinalados.",
          instance: "/api/auth/register",
          errors: { password: ["A palavra-passe tem de ter, no mínimo, 8 caracteres."] },
        },
        "application/problem+json",
      ),
    );
    const error = await api("/auth/register", { method: "POST" }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 400,
      detail: "Corrija os campos assinalados.",
      errors: { password: ["A palavra-passe tem de ter, no mínimo, 8 caracteres."] },
    });
  });

  it.each([
    [403, "https://localhub.local/erros/perfil-em-falta", "Crie o seu perfil profissional."],
    [404, "https://tools.ietf.org/html/rfc9110#section-15.5.5", "O serviço não existe."],
    [409, "https://localhub.local/erros/transicao-invalida", "Não é possível cancelar."],
    [503, "https://tools.ietf.org/html/rfc9110#section-15.6.4", "Serviço de moradas indisponível."],
  ])("%i: lança ApiError com o type e o detail do backend", async (status, type, detail) => {
    fetchMock.mockResolvedValue(
      jsonResponse(status, { type, title: "Erro", status, detail, instance: "/api/x" }),
    );
    const error = await api("/x").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status, type, detail, errors: undefined });
    expect(assignMock).not.toHaveBeenCalled();
  });

  it("erro sem corpo JSON: usa uma mensagem genérica", async () => {
    fetchMock.mockResolvedValue(new Response("Bad Gateway", { status: 502 }));
    const error = await api("/x").catch((e: unknown) => e);
    expect(error).toMatchObject({ status: 502, type: "", detail: "Ocorreu um erro inesperado." });
  });
});

describe("api: 401 (sessão expirada ou revogada)", () => {
  it("termina a sessão local, limpa a cache e volta ao início de sessão", async () => {
    setToken("token-expirado");
    queryClient.setQueryData(["auth", "me"], { userId: 45 });
    fetchMock.mockResolvedValue(
      jsonResponse(401, {
        type: "https://tools.ietf.org/html/rfc9110#section-15.5.2",
        title: "Sessão inválida",
        status: 401,
        detail: "A sua sessão terminou. Inicie sessão novamente.",
        instance: "/api/services",
      }),
    );

    const error = await api("/services").catch((e: unknown) => e);

    expect(error).toMatchObject({ status: 401 });
    expect(getToken()).toBeNull();
    expect(queryClient.getQueryData(["auth", "me"])).toBeUndefined();
    expect(assignMock).toHaveBeenCalledWith("/login");
  });

  it("no próprio início de sessão (credenciais-invalidas), não redireciona", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(401, {
        type: "https://localhub.local/erros/credenciais-invalidas",
        title: "Credenciais inválidas",
        status: 401,
        detail: "O e-mail ou a palavra-passe estão incorretos.",
        instance: "/api/auth/login",
      }),
    );
    const error = await api("/auth/login", { method: "POST" }).catch((e: unknown) => e);
    expect(error).toMatchObject({
      status: 401,
      detail: "O e-mail ou a palavra-passe estão incorretos.",
    });
    expect(assignMock).not.toHaveBeenCalled();
  });
});

describe("api: sem ligação ao backend", () => {
  it("o erro de rede não é um ApiError (permite distinguir «sem resposta»)", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const error = await api("/services").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(TypeError);
    expect(error).not.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1); // o api() nunca repete o pedido
  });
});

describe("token da sessão", () => {
  it("guarda, lê e apaga o token", () => {
    expect(getToken()).toBeNull();
    setToken("abc");
    expect(getToken()).toBe("abc");
    clearToken();
    expect(getToken()).toBeNull();
  });
});

describe("toQueryString", () => {
  it("monta os parâmetros e ignora os valores undefined", () => {
    expect(toQueryString({ status: "PENDING", page: 2, pageSize: undefined })).toBe(
      "status=PENDING&page=2",
    );
    expect(toQueryString({ withinServiceRadius: true })).toBe("withinServiceRadius=true");
    expect(toQueryString({})).toBe("");
  });

  it("codifica os valores de texto", () => {
    expect(toQueryString({ address: "Rua de Costa Cabral 500, Porto" })).toBe(
      "address=Rua+de+Costa+Cabral+500%2C+Porto",
    );
  });
});
