// Datas do dia da execução em UTC (AAAA-MM-DD), como as datas de criação dos serviços no backend:
// o período dos relatórios aplica-se a essas datas, por isso os filtros usam o mesmo dia.

export function utcDay(offsetDays = 0): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export function todayUtc(): string {
  return utcDay(0);
}

export function yesterdayUtc(): string {
  return utcDay(-1);
}
