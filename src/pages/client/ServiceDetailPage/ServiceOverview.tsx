import { CircleAlert } from "lucide-react";
import type { ServiceDetail } from "@/api/types";
import { ServiceHistory } from "@/components/services/ServiceHistory";
import { ServiceMeta } from "@/components/services/ServiceMeta";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/utils/format";
import { proposalModelLabels, serviceStatusLabels, serviceStatusTone } from "@/utils/labels";
import styles from "./ServiceOverview.module.css";

type Props = {
  service: ServiceDetail;
  currentUserId: number | undefined;
  acceptedProviderName: string | undefined;
  onCancel: () => void;
  onComplete: () => void;
  onReview: () => void;
  disabled: boolean; // enquanto uma ação decorre
};

// Ações conforme o estado: aberto, cancelar; atribuído, marcar como realizado e cancelar; realizado e
// sem avaliação, avaliar; avaliado ou cancelado, nenhuma
function ServiceActions({ service, onCancel, onComplete, onReview, disabled }: Props) {
  const { status, reviewed } = service;
  const canCancel = status === "OPEN" || status === "ASSIGNED";
  const canReview = status === "COMPLETED" && !reviewed;
  if (!canCancel && !canReview) {
    return null;
  }
  return (
    <div className={styles.actions}>
      {status === "ASSIGNED" && (
        <Button onClick={onComplete} disabled={disabled}>
          Marcar como realizado
        </Button>
      )}
      {canReview && (
        <Button onClick={onReview} disabled={disabled}>
          Avaliar serviço
        </Button>
      )}
      {canCancel && (
        <Button variant="danger-outline" onClick={onCancel} disabled={disabled}>
          Cancelar serviço
        </Button>
      )}
    </div>
  );
}

// Faixa do serviço cancelado, a partir da última alteração do histórico
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

// Cartão de cima do detalhe: título, modalidade e estado, as ações do Cliente, dados, descrição e
// histórico. As confirmações e a avaliação são abertas pela página.
export function ServiceOverview(props: Props) {
  const { service, currentUserId, acceptedProviderName } = props;
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
        <ServiceActions {...props} />
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
