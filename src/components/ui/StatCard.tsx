import type { ReactNode } from "react";
import styles from "./StatCard.module.css";

type Props = { value: ReactNode; label: string; highlight?: boolean };

// Número em destaque com a legenda por baixo (ex.: os totais do início da administração)
export function StatCard({ value, label, highlight = false }: Props) {
  return (
    <article className={styles.statCard} data-highlight={highlight || undefined}>
      <p className={styles.value}>{value}</p>
      <p className={styles.label}>{label}</p>
    </article>
  );
}
