import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./Callout.module.css";

type Props = {
  children: ReactNode;
  icon?: LucideIcon;
  id?: string;
  tone?: "info" | "warning" | "danger"; // info: verde claro (por omissão); warning: amarelo (avisos); danger: vermelho (ex.: serviço cancelado)
};

// Faixa colorida com uma informação para o utilizador (ex.: o contacto de suporte, um aviso)
export function Callout({ children, icon: Icon, id, tone = "info" }: Props) {
  return (
    <div className={styles.callout} id={id} data-tone={tone}>
      {Icon && <Icon size={16} aria-hidden="true" />}
      <p>{children}</p>
    </div>
  );
}
