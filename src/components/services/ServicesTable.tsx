import type { ServiceItem } from "@/api/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, type Column } from "@/components/ui/Table";
import { formatDate } from "@/utils/format";
import { proposalModelLabels, serviceStatusLabels, serviceStatusTone } from "@/utils/labels";
import styles from "./ServicesTable.module.css";

type Props = {
  items: ServiceItem[];
  detailed?: boolean; // a lista completa: com a categoria e a data, e o detalhe sabe que veio dela
  onCancel?: (service: ServiceItem) => void; // com ele, «Cancelar» nos serviços abertos e atribuídos
  disabled?: boolean; // enquanto a lista atualiza ou um cancelamento decorre
};

// Modalidade; nas solicitações diretas, com o número de Prestadores a quem foi pedida
function modelText(s: ServiceItem): string {
  const label = proposalModelLabels[s.proposalModel];
  return s.proposalModel === "DIRECT_REQUEST" ? `${label} (${s.directRequestsCount})` : label;
}

// Só os serviços abertos e atribuídos podem ser cancelados
const cancellable = (s: ServiceItem) => s.status === "OPEN" || s.status === "ASSIGNED";

// Serviços do Cliente: os recentes no início e, com detailed, a lista completa com o cancelamento
export function ServicesTable({ items, detailed = false, onCancel, disabled = false }: Props) {
  const columns: Column<ServiceItem>[] = [
    { header: "Serviço", cell: (s) => s.title, clamp: true },
    ...(detailed
      ? [{ header: "Categoria", cell: (s: ServiceItem) => s.serviceCategory.name }]
      : []),
    { header: "Modalidade", cell: modelText },
    { header: "Propostas", cell: (s) => s.proposalsCount },
    ...(detailed ? [{ header: "Data", cell: (s: ServiceItem) => formatDate(s.creationDate) }] : []),
    {
      header: "Estado",
      cell: (s) => (
        <Badge tone={serviceStatusTone[s.status]}>{serviceStatusLabels[s.status]}</Badge>
      ),
    },
    {
      header: "Ações",
      cell: (s) => (
        <div className={styles.actions}>
          {onCancel && cancellable(s) && (
            <Button variant="danger-outline" onClick={() => onCancel(s)} disabled={disabled}>
              Cancelar
            </Button>
          )}
          <Button
            variant="secondary"
            to={`/servicos/${s.serviceId}`}
            state={detailed ? { fromList: true } : undefined}
          >
            Abrir
          </Button>
        </div>
      ),
    },
  ];

  return <Table columns={columns} rows={items} rowKey={(s) => s.serviceId} />;
}
