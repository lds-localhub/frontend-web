import type { LucideIcon } from "lucide-react";
import { Link } from "react-router";
import styles from "./ShortcutCard.module.css";

type Props = {
  to: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  tone?: "primary" | "warning" | "info";
};

// Atalho dos inícios: cartão inteiro como ligação, com o ícone, o título e uma linha de descrição
export function ShortcutCard({ to, title, description, icon: Icon, tone = "primary" }: Props) {
  return (
    <Link to={to} className={styles.shortcutCard}>
      {Icon && (
        <span className={styles.icon} data-tone={tone}>
          <Icon size={20} aria-hidden="true" />
        </span>
      )}
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        <span className={styles.description}>{description}</span>
      </span>
    </Link>
  );
}
