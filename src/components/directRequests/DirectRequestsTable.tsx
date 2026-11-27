import type { DirectRequestItem } from "@/api/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, type Column } from "@/components/ui/Table";
import { formatAvailability } from "@/utils/format";
import { directRequestStatusLabels, directRequestStatusTone } from "@/utils/labels";

type Props = { items: DirectRequestItem[] };

// Botão de cada linha conforme o estado: responder à pendente, ver a proposta já apresentada, ou
// abrir as que já não têm resposta possível
function RowAction({ item }: { item: DirectRequestItem }) {
  if (item.status === "PENDING") {
    return <Button to={`/solicitacoes/${item.directRequestId}`}>Responder</Button>;
  }
  if (item.status === "PROPOSAL_SUBMITTED" && item.proposalId !== null) {
    return (
      <Button variant="secondary" to={`/propostas/${item.proposalId}`}>
        Ver proposta
      </Button>
    );
  }
  return (
    <Button variant="secondary" to={`/solicitacoes/${item.directRequestId}`}>
      Abrir
    </Button>
  );
}

const columns: Column<DirectRequestItem>[] = [
  { header: "Cliente", cell: (r) => r.service.clientName },
  { header: "Serviço", cell: (r) => r.service.title, clamp: true },
  { header: "Categoria", cell: (r) => r.service.serviceCategory.name },
  {
    header: "Disponibilidade",
    cell: (r) => formatAvailability(r.service.requestedStartDate, r.service.requestedEndDate),
  },
  {
    header: "Estado",
    cell: (r) => (
      <Badge tone={directRequestStatusTone[r.status]}>{directRequestStatusLabels[r.status]}</Badge>
    ),
  },
  { header: "Ações", cell: (r) => <RowAction item={r} /> },
];

// Solicitações diretas recebidas pelo Prestador, com a ação de cada estado
export function DirectRequestsTable({ items }: Props) {
  return <Table columns={columns} rows={items} rowKey={(r) => r.directRequestId} />;
}
