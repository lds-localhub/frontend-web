import { Star } from "lucide-react";
import { formatRating } from "@/utils/format";
import { Stars } from "./Stars";
import styles from "./Rating.module.css";

type Props = { value: number | null; count: number; variant?: "compact" | "stars" };

// Classificação média e número de avaliações: compact, uma estrela e «4,6 (12)»;
// stars, as cinco estrelas e o mesmo texto. Sem avaliações, «Sem avaliações».
export function Rating({ value, count, variant = "compact" }: Props) {
  return (
    <span className={styles.rating}>
      {variant === "stars" && value !== null ? (
        <Stars value={value} />
      ) : (
        <Star className={styles.star} size={14} aria-hidden="true" />
      )}
      {formatRating(value, count)}
    </span>
  );
}
