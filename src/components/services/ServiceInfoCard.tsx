import { UserRound } from "lucide-react";
import type { ProposalDetail, SearchServiceDetail } from "@/api/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/utils/format";
import { serviceStatusLabels, serviceStatusTone } from "@/utils/labels";
import { ServiceMeta } from "./ServiceMeta";
import styles from "./ServiceInfoCard.module.css";

type Props = {
  // serviço da pesquisa (sempre aberto a propostas e ainda aberto) ou o serviço de uma proposta enviada
  service: SearchServiceDetail | ProposalDetail["service"];
  clientName?: string; // só na proposta enviada
};

// Cartão do serviço visto pelo Prestador: título e estado, categoria, local, disponibilidade,
// publicação e descrição, sem os contactos do Cliente
export function ServiceInfoCard({ service, clientName }: Props) {
  const status = "status" in service ? service.status : "OPEN";
  const isPublic = !("proposalModel" in service) || service.proposalModel === "PUBLIC";

  return (
    <Card>
      <div className={styles.info}>
        <div className={styles.heading}>
          <h1 className={styles.title}>{service.title}</h1>
          <Badge tone={serviceStatusTone[status]}>{serviceStatusLabels[status]}</Badge>
        </div>
        <div className={styles.meta}>
          <Badge tone="neutral">{service.serviceCategory.name}</Badge>
          <ServiceMeta
            location={service.location}
            distanceKm={service.distanceKm}
            requestedStartDate={service.requestedStartDate}
            requestedEndDate={service.requestedEndDate}
          />
        </div>
        {(isPublic || clientName) && (
          <p className={styles.details}>
            {isPublic && <span>Publicado em {formatDate(service.creationDate)}</span>}
            {clientName && (
              <span className={styles.client}>
                <UserRound size={14} aria-hidden="true" />
                Cliente: {clientName}
              </span>
            )}
          </p>
        )}
        <p className={styles.description}>«{service.description}»</p>
      </div>
    </Card>
  );
}
