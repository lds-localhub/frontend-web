import { Check, Plus, Star } from "lucide-react";
import type { ProviderSearchItem } from "@/api/types";
import { formatDistance, formatRating } from "@/utils/format";
import styles from "./ProviderOption.module.css";

type Props = {
  result: ProviderSearchItem;
  selected: boolean;
  onToggle: () => void;
  onViewProfile: () => void;
};

// Um Prestador nos resultados do painel: botão de seleção, nome, classificação, distância e raio, e
// «Ver perfil», que abre numa janela para não sair do formulário
export function ProviderOption({ result, selected, onToggle, onViewProfile }: Props) {
  const details = [
    formatRating(result.averageRating, result.reviewCount),
    formatDistance(result.distanceKm),
    `raio ${result.serviceRadiusKm} km${result.withinServiceRadius ? "" : " (fora do raio)"}`,
  ].join(" · ");

  return (
    <div className={styles.option}>
      <button
        type="button"
        className={styles.toggle}
        data-selected={selected || undefined}
        aria-pressed={selected}
        aria-label={`${selected ? "Retirar" : "Selecionar"} ${result.name}`}
        onClick={onToggle}
      >
        {selected ? <Check size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
      </button>
      <div className={styles.info}>
        <p className={styles.name}>{result.name}</p>
        <p className={styles.details}>
          {result.averageRating !== null && (
            <Star className={styles.star} size={12} aria-hidden="true" />
          )}
          {details}
        </p>
      </div>
      <button type="button" className={styles.viewProfile} onClick={onViewProfile}>
        Ver perfil
      </button>
    </div>
  );
}
