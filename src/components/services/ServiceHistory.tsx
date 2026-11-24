import type { ServiceHistoryEntry } from "@/api/types";
import { formatDate } from "@/utils/format";
import { serviceStatusLabels } from "@/utils/labels";
import styles from "./ServiceHistory.module.css";

type Props = {
  // A criação não vem no histórico do E22 (só as mudanças de estado), por isso vem à parte
  created: { at: string; byName: string; byUserId: number | undefined };
  history: ServiceHistoryEntry[];
  currentUserId: number | undefined;
  acceptedProviderName?: string; // para «Atribuído · Proposta de <nome> aceite»
};

// Histórico do serviço: a criação e as mudanças de estado, com a data e quem as fez. A última fica
// destacada (verde, ou vermelha se for o cancelamento), como no protótipo.
export function ServiceHistory({ created, history, currentUserId, acceptedProviderName }: Props) {
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
      <h2 className={styles.title}>Histórico do serviço</h2>
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
