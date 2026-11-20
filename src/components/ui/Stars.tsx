import { Star } from "lucide-react";
import { formatAverageRating } from "@/utils/format";
import styles from "./Stars.module.css";

type Props = { value: number };

// Cinco estrelas, com as primeiras «value» preenchidas (arredondado à estrela mais próxima)
export function Stars({ value }: Props) {
  const filled = Math.round(value);
  return (
    <span
      className={styles.stars}
      role="img"
      aria-label={`${formatAverageRating(value)} em 5 estrelas`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={14} data-filled={n <= filled || undefined} aria-hidden="true" />
      ))}
    </span>
  );
}
