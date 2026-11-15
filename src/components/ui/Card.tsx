import type { ReactNode } from "react";
import styles from "./Card.module.css";

type Props = { children: ReactNode };

// Cartão branco com contorno e cantos arredondados, onde ficam os formulários e os blocos das páginas
export function Card({ children }: Props) {
  return <section className={styles.card}>{children}</section>;
}
