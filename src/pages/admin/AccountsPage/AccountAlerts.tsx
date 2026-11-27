import type { AccountAlert } from "@/api/types";
import { Tooltip } from "@/components/ui/Tooltip";
import styles from "./AccountAlerts.module.css";

const oneDecimal = new Intl.NumberFormat("pt-PT", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

// A API só devolve os números de cada alerta; o texto e a percentagem são feitos aqui
function alertText(alert: AccountAlert): string {
  if (alert.type === "ASSIGNED_CANCELLATIONS") {
    const percentage = Math.round((alert.count / alert.total) * 100);
    return `Cancelamentos de serviços atribuídos: ${alert.count} de ${alert.total} (${percentage}%)`;
  }
  return `Classificação média baixa: ${oneDecimal.format(alert.averageRating)} (${alert.reviewCount} avaliações)`;
}

type Props = { alerts: AccountAlert[] };

// Coluna «Alertas»: «—» sem alertas; com alertas, «⚠ N» e o detalhe ao passar o cursor
export function AccountAlerts({ alerts }: Props) {
  if (alerts.length === 0) {
    return <span>—</span>;
  }

  const title = alerts.length === 1 ? "1 alerta" : `${alerts.length} alertas`;

  return (
    <Tooltip
      content={
        <>
          <strong>{title}</strong>
          {alerts.map((alert) => (
            <span key={alert.type} className={styles.line}>
              {alertText(alert)}
            </span>
          ))}
        </>
      }
    >
      <span className={styles.count}>⚠ {alerts.length}</span>
    </Tooltip>
  );
}
