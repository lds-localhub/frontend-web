import type { ReactNode } from "react";
import styles from "./BackLink.module.css";

type Props = { children: ReactNode; onClick: () => void };

// Ligação «‹ Voltar» por cima do conteúdo; quem a usa decide para onde volta
export function BackLink({ children, onClick }: Props) {
  return (
    <button type="button" className={styles.backLink} onClick={onClick}>
      <span aria-hidden="true">‹</span> {children}
    </button>
  );
}
