import type { DirectRequestDetail } from "@/api/types";
import { ServiceHistory } from "@/components/services/ServiceHistory";
import { ServiceMeta } from "@/components/services/ServiceMeta";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/utils/format";
import { directRequestStatusLabels, directRequestStatusTone } from "@/utils/labels";
import styles from "./DirectRequestHeader.module.css";

type Props = { data: DirectRequestDetail };

// Cliente e estado da solicitação, e o cartão do serviço com o histórico
export function DirectRequestHeader({ data }: Props) {
  const { service } = data;
  const clientName = `${service.clientName} (Cliente)`;
  // O histórico visto pelo Prestador só diz o papel de quem fez cada alteração, para não identificar
  // o Prestador contratado; as do Cliente levam o nome dele
  const history = service.history.map((h) => ({
    ...h,
    changedByName: h.changedByRole === "CLIENT" ? clientName : "Prestador",
  }));

  return (
    <>
      <div className={styles.heading}>
        <Avatar name={service.clientName} size="lg" />
        <h1 className={styles.title}>Solicitação de {service.clientName}</h1>
        <Badge tone={directRequestStatusTone[data.status]}>
          {directRequestStatusLabels[data.status]}
        </Badge>
      </div>
      <Card>
        <div className={styles.service}>
          <p className={styles.serviceTitle}>
            {service.serviceCategory.name} · «{service.title}»
          </p>
          <div className={styles.meta}>
            <ServiceMeta
              location={service.location}
              distanceKm={service.distanceKm}
              requestedStartDate={service.requestedStartDate}
              requestedEndDate={service.requestedEndDate}
            />
            <p className={styles.received}>
              Solicitação recebida a {formatDate(data.creationDate)}
            </p>
          </div>
          <p className={styles.description}>«{service.description}»</p>
          <hr className={styles.divider} />
          <ServiceHistory
            created={{ at: service.creationDate, byName: clientName, byUserId: undefined }}
            history={history}
            currentUserId={undefined}
            status={service.status}
          />
        </div>
      </Card>
    </>
  );
}
