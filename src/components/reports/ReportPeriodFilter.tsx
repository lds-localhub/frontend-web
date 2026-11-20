import { useState, type ChangeEvent, type FormEvent } from "react";
import type { ReportParams } from "@/api/types";
import { Button } from "@/components/ui/Button";
import { DateField } from "@/components/ui/DateField";
import styles from "./ReportPeriodFilter.module.css";

type Props = { value: ReportParams; onApply: (params: ReportParams) => void };

const invertedMessage = "A data final não pode ser anterior à data inicial.";

// Período dos relatórios (datas opcionais e independentes), aplicado só em «Aplicar». Com a data inicial
// posterior à final, mostra o erro por baixo da data final e não aplica o período.
// Quem o usa recria-o com uma key quando o URL muda, para o rascunho voltar aos valores aplicados.
export function ReportPeriodFilter({ value, onApply }: Props) {
  const [draft, setDraft] = useState({
    startDate: value.startDate ?? "",
    endDate: value.endDate ?? "",
  });
  const [dateError, setDateError] = useState<string | null>(null);

  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDraft((prev) => ({ ...prev, startDate: e.target.value }));
    setDateError(null);
  };

  const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDraft((prev) => ({ ...prev, endDate: e.target.value }));
    setDateError(null);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const startDate = draft.startDate || undefined;
    const endDate = draft.endDate || undefined;
    // No formato AAAA-MM-DD, a ordem do texto é a ordem das datas
    if (startDate && endDate && startDate > endDate) {
      setDateError(invertedMessage);
      return;
    }
    setDateError(null);
    onApply({ startDate, endDate });
  };

  return (
    <form className={styles.filter} noValidate onSubmit={handleSubmit} aria-label="Período">
      <div className={styles.date}>
        <DateField label="Data inicial" value={draft.startDate} onChange={handleStartDateChange} />
      </div>
      <div className={styles.date}>
        <DateField
          label="Data final"
          value={draft.endDate}
          onChange={handleEndDateChange}
          error={dateError ?? undefined}
        />
      </div>
      <div className={styles.apply}>
        <Button type="submit" variant="secondary">
          Aplicar
        </Button>
      </div>
    </form>
  );
}
