import { describe, expect, it } from "vitest";
import { ApiError } from "./client";
import { queryClient } from "./queryClient";

const retry = queryClient.getDefaultOptions().queries?.retry;

function shouldRetry(failureCount: number, error: Error) {
  if (typeof retry !== "function") throw new Error("retry não é uma função");
  return retry(failureCount, error);
}

describe("queryClient", () => {
  it("não repete leituras com erros 4xx", () => {
    for (const status of [400, 401, 403, 404, 409]) {
      expect(shouldRetry(0, new ApiError(status, "", "Erro"))).toBe(false);
    }
  });

  it("repete até 2 vezes as leituras com erros 5xx ou sem rede", () => {
    for (const error of [new ApiError(503, "", "Indisponível"), new TypeError("Failed to fetch")]) {
      expect(shouldRetry(0, error)).toBe(true);
      expect(shouldRetry(1, error)).toBe(true);
      expect(shouldRetry(2, error)).toBe(false);
    }
  });

  it("nunca repete as ações (mutações), nem sem rede (RNF-23)", () => {
    expect(queryClient.getDefaultOptions().mutations?.retry).toBeUndefined(); // por omissão: 0
    expect(queryClient.getMutationCache().config.onError).toBeUndefined();
  });
});
