import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api, toQueryString } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { Page, ProposalItem, ProposalStatus, ProposalsParams } from "@/api/types";
import { CancelServiceDialog } from "@/components/services/CancelServiceDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { Loading } from "@/components/ui/Loading";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { Table, type Column } from "@/components/ui/Table";
import { toast } from "@/components/ui/Toast";
import { useCancelService } from "@/hooks/useCancelService";
import { useUrlParams } from "@/hooks/useUrlParams";
import { formatAvailability, formatCurrency } from "@/utils/format";
import {
  proposalStatusLabels,
  proposalStatusTone,
  serviceStatusLabels,
  serviceStatusTone,
} from "@/utils/labels";
import { parseId } from "@/utils/parseId";
import styles from "./MyProposalsPage.module.css";

const proposalStatuses: ProposalStatus[] = ["PENDING", "ACCEPTED", "DECLINED", "VOID"];

// Estado e página do URL; um valor que não exista é ignorado
function readProposalsParams(searchParams: URLSearchParams): ProposalsParams {
  return {
    status: proposalStatuses.find((s) => s === searchParams.get("status")),
    page: parseId(searchParams.get("page")) ?? undefined,
  };
}

// Só o Prestador com a proposta aceite pode cancelar, e só enquanto o serviço está atribuído
const canCancel = (p: ProposalItem) => p.status === "ACCEPTED" && p.service.status === "ASSIGNED";

// Propostas apresentadas pelo Prestador, da mais recente para a mais antiga, com o estado da proposta
// e o do serviço
export function MyProposalsPage() {
  const { params, setFilters, setPage } = useUrlParams(readProposalsParams);
  const proposals = useQuery({
    queryKey: queryKeys.proposals.list(params),
    queryFn: () => api<Page<ProposalItem>>(`/proposals?${toQueryString(params)}`),
    // Ao mudar de página ou de filtro, a lista anterior fica visível em vez do loading
    placeholderData: keepPreviousData,
  });
  const cancel = useCancelService();
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const confirming = proposals.data?.items.find((p) => p.proposalId === confirmingId);
  // Os botões ficam desativados enquanto a lista atualiza ou o cancelamento decorre
  const busy = proposals.isFetching || cancel.isPending;

  const handleConfirmCancel = () => {
    if (!confirming) {
      return;
    }
    cancel.mutate(confirming.service.serviceId, {
      onSuccess: () => toast("Serviço cancelado."),
      onSettled: () => setConfirmingId(null),
    });
  };

  const columns: Column<ProposalItem>[] = [
    { header: "Serviço", cell: (p) => p.service.title, rowHeader: true, clamp: true },
    { header: "Cliente", cell: (p) => p.service.clientName },
    { header: "Categoria", cell: (p) => p.service.serviceCategory.name },
    {
      header: "Disponibilidade",
      cell: (p) => formatAvailability(p.service.requestedStartDate, p.service.requestedEndDate),
    },
    { header: "Valor", cell: (p) => <strong>{formatCurrency(p.amount)}</strong> },
    {
      header: "Proposta",
      cell: (p) => (
        <Badge tone={proposalStatusTone[p.status]}>{proposalStatusLabels[p.status]}</Badge>
      ),
    },
    {
      header: "Serviço",
      cell: (p) => (
        <Badge tone={serviceStatusTone[p.service.status]}>
          {serviceStatusLabels[p.service.status]}
        </Badge>
      ),
    },
    {
      header: "Ações",
      align: "end",
      cell: (p) => (
        <div className={styles.actions}>
          {canCancel(p) && (
            <Button
              variant="danger-outline"
              disabled={busy}
              onClick={() => setConfirmingId(p.proposalId)}
            >
              Cancelar
            </Button>
          )}
          <Button variant="secondary" to={`/propostas/${p.proposalId}`}>
            Abrir
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <title>As minhas propostas · LocalHub</title>
      <PageHeader title="As minhas propostas" />

      <div className={styles.filters}>
        <FilterSelect
          label="Estado da proposta"
          items={proposalStatuses.map((s) => ({ value: s, label: proposalStatusLabels[s] }))}
          value={params.status}
          onValueChange={(status) => setFilters({ status })}
        />
      </div>

      {proposals.isPending ? (
        <Loading />
      ) : proposals.isError ? (
        <ErrorState
          error={proposals.error}
          onRetry={proposals.refetch}
          retrying={proposals.isFetching}
        />
      ) : proposals.data.total > 0 && proposals.data.items.length === 0 ? (
        // Página que ficou vazia (ex.: filtrada por «Pendente», o Cliente já decidiu as que tinha).
        // A paginação não aparece com uma só página, por isso há o caminho de volta.
        <EmptyState>
          Esta página já não tem propostas.
          <Button variant="text" onClick={() => setPage(1)}>
            Ir para a primeira página
          </Button>
        </EmptyState>
      ) : proposals.data.items.length === 0 ? (
        <EmptyState>
          {params.status ? "Não tem propostas neste estado." : "Ainda não apresentou propostas."}
        </EmptyState>
      ) : (
        <div className={styles.list} data-stale={proposals.isPlaceholderData || undefined}>
          <Table columns={columns} rows={proposals.data.items} rowKey={(p) => p.proposalId} />
          <Pagination
            page={proposals.data}
            onPageChange={setPage}
            disabled={proposals.isPlaceholderData}
          />
        </div>
      )}

      <CancelServiceDialog
        open={confirming !== undefined}
        serviceTitle={confirming?.service.title ?? ""}
        pending={cancel.isPending}
        onConfirm={handleConfirmCancel}
        onClose={() => setConfirmingId(null)}
      />
    </div>
  );
}
