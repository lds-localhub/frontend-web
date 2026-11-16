import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

type Props = { title: string; actions?: ReactNode };

// Título da página, com as ações da página à direita (ex.: «Nova categoria»)
export function PageHeader({ title, actions }: Props) {
  return (
    <div className={styles.pageHeader}>
      <h1>{title}</h1>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
