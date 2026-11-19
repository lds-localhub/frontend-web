import type { MonthlyRating } from "@/api/types";
import { Card } from "@/components/ui/Card";
import { formatAverageRating, formatMonth, formatReviewCount } from "@/utils/format";
import styles from "./RatingEvolution.module.css";

type Props = { months: MonthlyRating[] };

export function RatingEvolution({ months }: Props) {
  return (
    <Card>
      <h2 className={styles.title}>Evolução da classificação média</h2>
      {months.length === 0 ? (
        <p className={styles.empty}>Sem avaliações no período escolhido.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Mês · avaliações recebidas</th>
              <th scope="col" className={styles.average}>
                Média
              </th>
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
