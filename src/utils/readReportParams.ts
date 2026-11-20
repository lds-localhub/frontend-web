import type { ReportParams } from "@/api/types";

// Período dos relatórios no URL (startDate e endDate, independentes): cada data só é aceite no formato
// AAAA-MM-DD e se existir no calendário; uma data inválida é ignorada (sem esse limite)
export function readReportParams(searchParams: URLSearchParams): ReportParams {
  return {
    startDate: readDay(searchParams.get("startDate")),
    endDate: readDay(searchParams.get("endDate")),
  };
}

function readDay(value: string | null): string | undefined {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return undefined;
  }
  const [, year, month, day] = match.map(Number);
  // O dia 0 do mês seguinte é o último dia do mês pedido
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth) {
    return undefined;
  }
  return match[0];
}
