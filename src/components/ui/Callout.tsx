import type { ReactNode } from "react";
import styles from "./Callout.module.css";

type Props = {
  children: ReactNode;
  icon?: string;
  id?: string;
  tone?: "info" | "warning"; // info: verde claro (por omissão); warning: amarelo (avisos)
};

// Faixa colorida com uma informação para o utilizador (ex.: o contacto de suporte, um aviso)
export function Callout({ children, icon, id, tone = "info" }: Props) {
  return (
    <div className={styles.callout} id={id} data-tone={tone}>
      {icon && <img src={icon} alt="" />}
      <p>{children}</p>
    </div>
  );
}
