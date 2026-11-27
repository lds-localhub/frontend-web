import type { ProfessionalProfileSummary } from "@/api/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import type { Tone } from "@/utils/labels";
import styles from "./ResponseCard.module.css";

type Props = {
  provider: ProfessionalProfileSummary;
  status: { label: string; tone: Tone };
  dates: string; // ex.: «Enviada 28/09/2026 · Respondida 29/09/2026»
};

// Coluna da esquerda dos cartões das solicitações e das propostas: o Prestador, o estado e as datas
export function ProviderSide({ provider, status, dates }: Props) {
  return (
    <div className={styles.provider}>
      <div className={styles.identity}>
        <Avatar name={provider.name} />
        <div>
          <p className={styles.name}>{provider.name}</p>
          <p className={styles.rating}>
            <Rating value={provider.averageRating} count={provider.reviewCount} />
          </p>
        </div>
      </div>
      <div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>
      <p className={styles.dates}>{dates}</p>
    </div>
  );
}
