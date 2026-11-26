import { describe, expect, it } from "vitest";
import { proposalSchema } from "./proposalSchema";

function validate(amount: unknown, conditions = "Inclui material e deslocação.", obs = "") {
  return proposalSchema.safeParse({ amount, conditions, obs });
}

function messagesOf(result: ReturnType<typeof validate>, field: string): string[] {
  if (result.success) {
    return [];
  }
  return result.error.issues.filter((i) => i.path[0] === field).map((i) => i.message);
}

describe("limites do valor da proposta", () => {
  it.each([
    ["o mínimo, 0,01", 0.01],
    ["um valor inteiro", 80],
    ["duas casas decimais", 80.55],
    ["uma casa decimal", 12.5],
    ["um valor cuja representação em vírgula flutuante não é exata", 0.07],
    ["outro valor com o mesmo problema", 1234.56],
    ["o máximo, 100 000,00", 100000],
  ])("aceita %s", (_, amount) => {
    expect(validate(amount).success).toBe(true);
  });

  it.each([
    ["0", 0],
    ["um valor negativo", -5],
  ])("recusa %s", (_, amount) => {
    expect(messagesOf(validate(amount), "amount")).toEqual(["O valor tem de ser maior que 0."]);
  });

  it.each([
    ["100 000,01", 100000.01],
    ["100 001", 100001],
  ])("recusa um valor acima do máximo, %s", (_, amount) => {
    expect(messagesOf(validate(amount), "amount")).toContain(
      "O valor não pode ser superior a 100 000,00 €.",
    );
  });

  it.each([
    ["três casas decimais", 80.555],
    ["abaixo do mínimo, com três casas decimais", 0.001],
  ])("recusa um valor com %s", (_, amount) => {
    expect(messagesOf(validate(amount), "amount")).toContain(
      "O valor tem, no máximo, duas casas decimais.",
    );
  });

  it.each([
    ["vazio", undefined],
    ["que não é um número", Number.NaN],
  ])("pede o valor quando está %s", (_, amount) => {
    expect(messagesOf(validate(amount), "amount")).toEqual(["Indique o valor."]);
  });
});

describe("condições e observação da proposta", () => {
  it("exige as condições, sem contar os espaços", () => {
    expect(messagesOf(validate(80, "   "), "conditions")).toEqual(["Indique as condições."]);
  });

  it("aceita as condições com 1000 caracteres e recusa com 1001", () => {
    expect(validate(80, "a".repeat(1000)).success).toBe(true);
    expect(messagesOf(validate(80, "a".repeat(1001)), "conditions")).toEqual([
      "As condições têm, no máximo, 1000 caracteres.",
    ]);
  });

  it("aceita a observação vazia ou com 500 caracteres e recusa com 501", () => {
    expect(validate(80, "Material incluído.", "").success).toBe(true);
    expect(validate(80, "Material incluído.", "a".repeat(500)).success).toBe(true);
    expect(messagesOf(validate(80, "Material incluído.", "a".repeat(501)), "obs")).toEqual([
      "A observação tem, no máximo, 500 caracteres.",
    ]);
  });
});
