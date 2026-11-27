import type { ServiceHistoryEntry, ServiceStatus } from "@/api/types";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/utils/format";
import { serviceStatusLabels, serviceStatusTone } from "@/utils/labels";
import styles from "./ServiceHistory.module.css";

// Ao Prestador, o backend só diz o papel de quem fez cada alteração, sem o ID: por isso pode faltar
type HistoryStep = Omit<ServiceHistoryEntry, "changedByUserId"> & { changedByUserId?: number };

type Props = {
  // O histórico do backend só tem as mudanças de estado: a criação do serviço é passada à parte
  created: { at: string; byName: string; byUserId: number | undefined };
  history: HistoryStep[];
  currentUserId: number | undefined;
  acceptedProviderName?: string; // para «Atribuído · Proposta de <nome> aceite»
  status?: ServiceStatus; // estado atual, ao lado do título (no detalhe da solicitação)
};

// Histórico do serviço: a criação e as mudanças de estado, com a data e quem as fez. A última fica
// destacada: verde, ou vermelha se for o cancelamento.
export function ServiceHistory({
  created,
  history,
  currentUserId,
  acceptedProviderName,
  status,
}: Props) {
  const steps = [
    {
      key: "created",
      title: `${serviceStatusLabels.OPEN} · Serviço criado`,
      at: created.at,
      byName: created.byName,
      byUserId: created.byUserId,
      status: "OPEN" as const,
    },
    ...history.map((h, i) => ({
      key: String(i),
      title:
        h.newStatus === "ASSIGNED" && acceptedProviderName
          ? `${serviceStatusLabels.ASSIGNED} · Proposta de ${acceptedProviderName} aceite`
          : serviceStatusLabels[h.newStatus],
      at: h.changedAt,
      byName: h.changedByName,
      byUserId: h.changedByUserId,
      status: h.newStatus,
    })),
  ];

  return (
    <div className={styles.history}>
      <div className={styles.heading}>
        <h2 className={styles.title}>Histórico do serviço</h2>
        {status && <Badge tone={serviceStatusTone[status]}>{serviceStatusLabels[status]}</Badge>}
      </div>
      <ol className={styles.steps}>
        {steps.map((s, i) => (
          <li
            key={s.key}
            className={styles.step}
            data-current={i === steps.length - 1 || undefined}
            data-status={s.status}
          >
            <span className={styles.dot} aria-hidden="true" />
            <div>
              <p className={styles.stepTitle}>{s.title}</p>
              <p className={styles.stepMeta}>
                {formatDate(s.at)} · {s.byName}
                {s.byUserId !== undefined && s.byUserId === currentUserId && " (você)"}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
