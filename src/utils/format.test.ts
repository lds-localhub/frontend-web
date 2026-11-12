import { describe, expect, it } from "vitest";
import {
  formatAvailability,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDay,
  formatDistance,
  formatRating,
} from "./format";

// Os testes correm com TZ = Europe/Lisbon (vitest.config.ts): UTC+1 no verão, UTC+0 no inverno.

describe("instantes UTC na hora local", () => {
  it("converte para a hora de verão de Lisboa (UTC+1)", () => {
    expect(formatDateTime("2026-09-28T10:00:00Z")).toBe("28/09/2026, 11:00");
  });

  it("converte para a hora de inverno de Lisboa (UTC+0)", () => {
    expect(formatDateTime("2026-12-15T10:00:00Z")).toBe("15/12/2026, 10:00");
  });

  it("muda de dia quando a hora local passa a meia-noite", () => {
    expect(formatDate("2026-09-28T23:30:00Z")).toBe("29/09/2026");
  });
});

describe("datas sem hora", () => {
  it("não dependem do fuso horário", () => {
    expect(formatDay("2026-10-13")).toBe("13/10/2026");
  });

  it("disponibilidade: intervalo ou data única", () => {
    expect(formatAvailability("2026-10-13", "2026-10-19")).toBe("13/10 a 19/10/2026");
    expect(formatAvailability("2026-12-28", "2027-01-04")).toBe("28/12/2026 a 04/01/2027");
    expect(formatAvailability("2026-10-08", null)).toBe("08/10/2026");
  });
});

describe("números", () => {
  it("euros com duas casas decimais", () => {
    // O Intl separa o valor do símbolo com um espaço não separável (U+00A0)
    expect(formatCurrency(350)).toBe("350,00 €");
    expect(formatCurrency(80.5)).toBe("80,50 €");
  });

  it("distâncias com uma casa decimal", () => {
    expect(formatDistance(3.2)).toBe("3,2 km");
    expect(formatDistance(15)).toBe("15,0 km");
  });

  it("classificação média com uma casa decimal, ou sem avaliações", () => {
    expect(formatRating(4.6, 12)).toBe("4,6 (12)");
    expect(formatRating(null, 0)).toBe("Sem avaliações");
  });
});
