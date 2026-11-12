// Formatação em pt-PT, como no protótipo. Os instantes chegam em UTC e são apresentados na hora local
// (secção 4.3 da Documentação da API).

const dateFormat = new Intl.DateTimeFormat("pt-PT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormat = new Intl.DateTimeFormat("pt-PT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const currencyFormat = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const oneDecimalFormat = new Intl.NumberFormat("pt-PT", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

// Instante UTC ("2026-09-28T10:00:00Z") → "28/09/2026", na hora local
export function formatDate(instant: string): string {
  return dateFormat.format(new Date(instant));
}

// Instante UTC → "28/09/2026, 11:00", na hora local
export function formatDateTime(instant: string): string {
  return dateTimeFormat.format(new Date(instant));
}

// Data sem hora ("2026-10-13") → "13/10/2026".
// Não passa por new Date(): seria lida como meia-noite UTC e, noutros fusos, mostraria o dia anterior.
export function formatDay(day: string): string {
  const [year, month, date] = day.split("-");
  return `${date}/${month}/${year}`;
}

// Disponibilidade pedida: "13/10 a 19/10/2026" (intervalo) ou "08/10/2026" (data única)
export function formatAvailability(start: string, end: string | null): string {
  if (!end) return formatDay(start);
  const [startYear, startMonth, startDate] = start.split("-");
  const startText = startYear === end.slice(0, 4) ? `${startDate}/${startMonth}` : formatDay(start);
  return `${startText} a ${formatDay(end)}`;
}

// 350 → "350,00 €"
export function formatCurrency(amount: number): string {
  return currencyFormat.format(amount);
}

// 3.2 → "3,2 km"
export function formatDistance(km: number): string {
  return `${oneDecimalFormat.format(km)} km`;
}

// 4.6 e 12 → "4,6 (12)"; sem avaliações → "Sem avaliações"
export function formatRating(averageRating: number | null, reviewCount: number): string {
  if (averageRating === null) return "Sem avaliações";
  return `${oneDecimalFormat.format(averageRating)} (${reviewCount})`;
}
