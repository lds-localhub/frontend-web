import type { ServiceItem } from "@/api/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, type Column } from "@/components/ui/Table";
import { formatDate } from "@/utils/format";
import { proposalModelLabels, serviceStatusLabels, serviceStatusTone } from "@/utils/labels";
import styles from "./ServicesTable.module.css";

type Props = {
  items: ServiceItem[];
  detailed?: boolean; // com a categoria e a data
  onCancel?: (service: ServiceItem) => void; // com ele, «Cancelar» nos serviços abertos e atribuídos
  disabled?: boolean; // enquanto a lista atualiza ou um cancelamento decorre
};

// Modalidade; nas solicitações diretas, com o número de Prestadores a quem foi pedida
function modelText(s: ServiceItem): string {
  const label = proposalModelLabels[s.proposalModel];
  return s.proposalModel === "DIRECT_REQUEST" ? `${label} (${s.directRequestsCount})` : label;
}

// Número de propostas e, se houver, quantas esperam pela decisão do Cliente
function proposalsText(s: ServiceItem): string {
  if (s.pendingProposalsCount === 0) {
    return String(s.proposalsCount);
  }
  const pending = s.pendingProposalsCount === 1 ? "pendente" : "pendentes";
  return `${s.proposalsCount} (${s.pendingProposalsCount} ${pending})`;
}

// Só os serviços abertos e atribuídos podem ser cancelados
const cancellable = (s: ServiceItem) => s.status === "OPEN" || s.status === "ASSIGNED";

// Serviços do Cliente: os recentes no início e, com detailed, a lista completa com o cancelamento
export function ServicesTable({ items, detailed = false, onCancel, disabled = false }: Props) {
  const columns: Column<ServiceItem>[] = [
    { header: "Serviço", cell: (s) => s.title, rowHeader: true, clamp: true },
    ...(detailed
      ? [{ header: "Categoria", cell: (s: ServiceItem) => s.serviceCategory.name }]
      : []),
    { header: "Modalidade", cell: modelText },
    { header: "Propostas", cell: proposalsText },
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
          <Button variant="secondary" to={`/servicos/${s.serviceId}`}>
            Abrir
          </Button>
        </div>
      ),
    },
  ];

  return <Table columns={columns} rows={items} rowKey={(s) => s.serviceId} />;
}
