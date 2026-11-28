import { describe, expect, it } from "vitest";
import { reviewSchema } from "./reviewSchema";

function validate(rating: unknown, comment = "") {
  return reviewSchema.safeParse({ rating, comment });
}

function messagesOf(result: ReturnType<typeof validate>, field: string): string[] {
  if (result.success) {
    return [];
  }
  return result.error.issues.filter((i) => i.path[0] === field).map((i) => i.message);
}

describe("classificação da avaliação", () => {
  it.each([1, 2, 3, 4, 5])("aceita %i estrelas", (rating) => {
    expect(validate(rating).success).toBe(true);
  });

  it.each([
    ["0", 0],
    ["6", 6],
    ["um valor negativo", -1],
    ["um valor não inteiro", 4.5],
    ["vazia", undefined],
    ["que não é um número", Number.NaN],
  ])("recusa a classificação %s", (_, rating) => {
    expect(messagesOf(validate(rating), "rating")).toContain("Escolha a classificação.");
  });
});

describe("comentário da avaliação", () => {
  it("aceita o comentário vazio, porque é opcional", () => {
    expect(validate(5, "").success).toBe(true);
  });

  it("aceita 500 caracteres e recusa 501", () => {
    expect(validate(5, "a".repeat(500)).success).toBe(true);
    expect(messagesOf(validate(5, "a".repeat(501)), "comment")).toEqual([
      "O comentário tem, no máximo, 500 caracteres.",
    ]);
  });

  it("não conta os espaços do início e do fim", () => {
    const result = validate(5, `  ${"a".repeat(500)}  `);
    expect(result.success).toBe(true);
    expect(result.success && result.data.comment).toHaveLength(500);
  });
});
