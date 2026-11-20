import { describe, expect, it } from "vitest";
import { formatDay, formatMonth } from "./format";

// Os testes unitários correm no fuso dos Açores (UTC−1 no inverno; vite.config.ts), onde ler uma
// data sem hora com new Date() dá a véspera. As funções têm de dar sempre o dia e o mês escritos.

describe("ambiente dos testes", () => {
  it("está num fuso em que new Date() muda o dia de uma data sem hora", () => {
    expect(new Date("2026-12-01").getDate()).toBe(30);
  });
});

describe("formatDay (datas sem hora)", () => {
  it.each([
    ["2026-10-13", "13/10/2026"],
    ["2026-12-01", "01/12/2026"],
    ["2027-01-01", "01/01/2027"],
    ["2026-12-31", "31/12/2026"],
    ["2028-02-29", "29/02/2028"],
  ])("%s → %s, sem mudar de dia", (day, expected) => {
    expect(formatDay(day)).toBe(expected);
  });
});

describe("formatMonth (mês do relatório)", () => {
  it.each([
    ["2026-01", "Janeiro 2026"],
    ["2026-07", "Julho 2026"],
    ["2026-11", "Novembro 2026"],
    ["2026-12", "Dezembro 2026"],
  ])("%s → %s, sem mudar de mês", (month, expected) => {
    expect(formatMonth(month)).toBe(expected);
  });

  it("escreve os nomes dos doze meses em português de Portugal", () => {
    const months = Array.from({ length: 12 }, (_, i) =>
      formatMonth(`2026-${String(i + 1).padStart(2, "0")}`),
    );
    expect(months).toEqual([
      "Janeiro 2026",
      "Fevereiro 2026",
      "Março 2026",
      "Abril 2026",
      "Maio 2026",
      "Junho 2026",
      "Julho 2026",
      "Agosto 2026",
      "Setembro 2026",
      "Outubro 2026",
      "Novembro 2026",
      "Dezembro 2026",
    ]);
  });
});
