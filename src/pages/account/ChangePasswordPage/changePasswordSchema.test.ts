import { describe, expect, it } from "vitest";
import { changePasswordSchema } from "./changePasswordSchema";

const passwordMessage =
  "A palavra-passe tem de ter, no mínimo, 8 caracteres, com pelo menos uma letra e um algarismo.";

function validate(
  newPassword: string,
  confirmPassword = newPassword,
  currentPassword = "Teste2026",
) {
  return changePasswordSchema.safeParse({ currentPassword, newPassword, confirmPassword });
}

function messagesOf(result: ReturnType<typeof validate>, field: string): string[] {
  if (result.success) {
    return [];
  }
  return result.error.issues.filter((i) => i.path[0] === field).map((i) => i.message);
}

describe("regra da palavra-passe nova (W23)", () => {
  it.each([
    ["8 caracteres, com letra e algarismo", "Nova2027"],
    ["só minúsculas e algarismos", "abcdefg1"],
    ["uma só letra", "1234567a"],
    ["um só algarismo", "abcdefgh1"],
    ["letras acentuadas a par de letras sem acento", "ação2026"],
    ["com espaços, que contam como caracteres", "ab 12   "],
  ])("aceita uma palavra-passe %s", (_, password) => {
    expect(validate(password).success).toBe(true);
  });

  it.each([
    ["com 7 caracteres", "Nova202"],
    ["sem algarismos", "abcdefgh"],
    ["sem letras", "12345678"],
    ["só com espaços", "        "],
    ["vazia", ""],
  ])("recusa uma palavra-passe %s, com a mensagem do backend", (_, password) => {
    expect(messagesOf(validate(password), "newPassword")).toContain(passwordMessage);
  });

  it("recusa a confirmação diferente da nova palavra-passe, no campo da confirmação", () => {
    const result = validate("Nova2027", "Nova2028");
    expect(messagesOf(result, "confirmPassword")).toEqual([
      "A confirmação não corresponde à nova palavra-passe.",
    ]);
    expect(messagesOf(result, "newPassword")).toEqual([]);
  });

  it("verifica a confirmação mesmo quando a nova palavra-passe é inválida", () => {
    expect(messagesOf(validate("abc", "abd"), "confirmPassword")).toHaveLength(1);
  });

  it("exige a palavra-passe atual, sem lhe aplicar as regras da nova", () => {
    expect(messagesOf(validate("Nova2027", "Nova2027", ""), "currentPassword")).toEqual([
      "Indique a palavra-passe atual.",
    ]);
    expect(validate("Nova2027", "Nova2027", "x").success).toBe(true);
  });
});
