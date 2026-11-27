import type { MonthlyRating } from "@/api/types";
import { Card } from "@/components/ui/Card";
import { formatAverageRating, formatMonth, formatReviewCount } from "@/utils/format";
import styles from "./RatingEvolution.module.css";

type Props = { months: MonthlyRating[]; hasPeriod: boolean };

// Lista vazia (E34): sem período, o Prestador ainda não tem avaliações; com período, também pode ter
// avaliações só depois do fim do período, que fica antes do mês da primeira avaliação
export function RatingEvolution({ months, hasPeriod }: Props) {
  return (
    <Card>
      <h2 className={styles.title}>Evolução da classificação média</h2>
      {months.length === 0 ? (
        <p className={styles.empty}>
          {hasPeriod ? "Sem avaliações no período escolhido." : "Ainda não tem avaliações."}
        </p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mês · avaliações recebidas</th>
              <th className={styles.average}>Média</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => (
              <tr key={m.month}>
                <th scope="row">
                  <span className={styles.month}>{formatMonth(m.month)}</span>
                  <span className={styles.count}>
                    {m.reviewCount === 0 ? "sem avaliações" : formatReviewCount(m.reviewCount)}
                  </span>
                </th>
                <td className={styles.average}>
                  {m.averageRating === null ? "—" : formatAverageRating(m.averageRating)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
