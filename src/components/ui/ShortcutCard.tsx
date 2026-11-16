import { Link } from "react-router";
import styles from "./ShortcutCard.module.css";

type Props = {
  to: string;
  title: string;
  description: string;
  icon?: string;
  tone?: "primary" | "warning";
};

// Atalho dos inícios: cartão inteiro como ligação, com o ícone, o título e uma linha de descrição
export function ShortcutCard({ to, title, description, icon, tone = "primary" }: Props) {
  return (
    <Link to={to} className={styles.shortcutCard}>
      {icon && (
        <span className={styles.icon} data-tone={tone}>
          <img src={icon} alt="" width={20} height={20} />
        </span>
      )}
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        <span className={styles.description}>{description}</span>
      </span>
    </Link>
  );
}
