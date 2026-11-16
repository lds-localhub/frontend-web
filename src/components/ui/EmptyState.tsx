import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";

// Mensagem de uma lista sem resultados (ex.: «Não há contas.»)
export function EmptyState({ children }: { children: ReactNode }) {
  return <p className={styles.empty}>{children}</p>;
}
