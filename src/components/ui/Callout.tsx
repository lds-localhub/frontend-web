import type { ReactNode } from "react";
import styles from "./Callout.module.css";

type Props = { children: ReactNode; icon?: string; id?: string };

// Faixa verde clara com uma informação para o utilizador (ex.: o contacto de suporte)
export function Callout({ children, icon, id }: Props) {
  return (
    <div className={styles.callout} id={id}>
      {icon && <img src={icon} alt="" />}
      <p>{children}</p>
    </div>
  );
}
