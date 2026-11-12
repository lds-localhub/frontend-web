import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/client";
import { applyServerErrors } from "./forms";
import { UNAVAILABLE_MESSAGE, getErrorMessage, getFieldErrors, isApiError } from "./errors";

const transicao = new ApiError(
  409,
  "https://localhub.local/erros/transicao-invalida",
  "Não é possível cancelar um serviço no estado realizado.",
);
const perfil = new ApiError(
  403,
  "https://localhub.local/erros/perfil-em-falta",
  "Crie o seu perfil profissional para continuar.",
);
const campos = new ApiError(400, "", "Corrija os campos assinalados.", {
  amount: ["O valor tem de ser maior que 0."],
  conditions: ["Indique as condições.", "Outra mensagem."],
});

describe("getErrorMessage", () => {
  it("mostra o detail do backend em qualquer código (403, 404, 409, 503)", () => {
    expect(getErrorMessage(transicao)).toBe(
      "Não é possível cancelar um serviço no estado realizado.",
    );
    expect(getErrorMessage(new ApiError(503, "", "Serviço de moradas indisponível."))).toBe(
      "Serviço de moradas indisponível.",
    );
  });

  it("sem resposta do backend, mostra a mensagem de indisponibilidade", () => {
    expect(getErrorMessage(new TypeError("Failed to fetch"))).toBe(UNAVAILABLE_MESSAGE);
    expect(UNAVAILABLE_MESSAGE).toBe("Não foi possível contactar o servidor. Tente novamente.");
  });
});

describe("isApiError", () => {
  it("distingue os tipos próprios do LocalHub", () => {
    expect(isApiError(transicao, "transicao-invalida")).toBe(true);
    expect(isApiError(transicao, "perfil-em-falta")).toBe(false);
    expect(isApiError(perfil, "perfil-em-falta")).toBe(true);
    expect(isApiError(perfil)).toBe(true);
  });

  it("não considera os erros de rede", () => {
    expect(isApiError(new TypeError("Failed to fetch"))).toBe(false);
  });
});

describe("getFieldErrors", () => {
  it("devolve os erros por campo só nos 400", () => {
    expect(getFieldErrors(campos)?.amount).toEqual(["O valor tem de ser maior que 0."]);
    expect(getFieldErrors(transicao)).toBeUndefined();
    expect(getFieldErrors(new TypeError("x"))).toBeUndefined();
  });
});

describe("applyServerErrors", () => {
  it("põe a primeira mensagem de cada campo no campo respetivo", () => {
    const setError = vi.fn();
    applyServerErrors(campos, setError);
    expect(setError).toHaveBeenCalledWith("amount", {
      type: "server",
      message: "O valor tem de ser maior que 0.",
    });
    expect(setError).toHaveBeenCalledWith("conditions", {
      type: "server",
      message: "Indique as condições.",
    });
  });

  it("um 400 sem erros por campo vai para o erro geral do formulário", () => {
    const setError = vi.fn();
    applyServerErrors(
      new ApiError(400, "", "A data de início é posterior à data de fim."),
      setError,
    );
    expect(setError).toHaveBeenCalledWith("root.server", {
      message: "A data de início é posterior à data de fim.",
    });
  });

  it("ignora os erros que não são 400 (mostrados pelo onError da mutação)", () => {
    const setError = vi.fn();
    applyServerErrors(transicao, setError);
    applyServerErrors(new TypeError("Failed to fetch"), setError);
    expect(setError).not.toHaveBeenCalled();
  });
});
