import { CircleAlert } from "lucide-react";
import type { ServiceDetail } from "@/api/types";
import { ServiceHistory } from "@/components/services/ServiceHistory";
import { ServiceMeta } from "@/components/services/ServiceMeta";
import { Badge } from "@/components/ui/Badge";
import { Callout } from "@/components/ui/Callout";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/utils/format";
import { proposalModelLabels, serviceStatusLabels, serviceStatusTone } from "@/utils/labels";
import styles from "./ServiceOverview.module.css";

type Props = {
  service: ServiceDetail;
  currentUserId: number | undefined;
  acceptedProviderName: string | undefined;
};

// Faixa do serviço cancelado, a partir da última alteração do histórico (textos do protótipo)
function CancelledBanner({ service }: { service: ServiceDetail }) {
  const c = service.history.at(-1);
  if (!c || c.newStatus !== "CANCELLED") {
    return null;
  }
  return (
    <Callout tone="danger" icon={CircleAlert}>
      {c.changedByRole === "PROVIDER" ? (
        <>
          <strong>Cancelado pelo Prestador</strong> ({c.changedByName}) a {formatDate(c.changedAt)}.
        </>
      ) : (
        <>
          <strong>Cancelou este serviço</strong> a {formatDate(c.changedAt)}
          {c.previousStatus === "OPEN" && ", quando ainda estava aberto"}.
        </>
      )}
    </Callout>
  );
}

// Cartão de cima do W15/W18: título, modalidade e estado, dados, descrição e histórico.
// Só de consulta: as ações (cancelar, marcar como realizado, avaliar) ficam para a tarefa C.
export function ServiceOverview({ service, currentUserId, acceptedProviderName }: Props) {
  return (
    <Card>
      <div className={styles.overview}>
        <div className={styles.header}>
          <h1 className={styles.title}>{service.title}</h1>
          <div className={styles.badges}>
            <Badge tone="success">{proposalModelLabels[service.proposalModel]}</Badge>
            <Badge tone={serviceStatusTone[service.status]}>
              {serviceStatusLabels[service.status]}
            </Badge>
          </div>
        </div>
        <CancelledBanner service={service} />
        <ServiceMeta
          category={service.serviceCategory}
          location={service.location}
          requestedStartDate={service.requestedStartDate}
          requestedEndDate={service.requestedEndDate}
          publishedAt={service.proposalModel === "PUBLIC" ? service.creationDate : undefined}
        />
        <p className={styles.description}>{service.description}</p>
        <hr className={styles.divider} />
        <ServiceHistory
          created={{
            at: service.creationDate,
            byName: service.clientName,
            byUserId: currentUserId,
          }}
          history={service.history}
          currentUserId={currentUserId}
          acceptedProviderName={acceptedProviderName}
        />
      </div>
    </Card>
  );
}
