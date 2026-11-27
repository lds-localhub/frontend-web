import type { DirectRequestStatus, DirectRequestsParams } from "@/api/types";
import { DirectRequestsTable } from "@/components/directRequests/DirectRequestsTable";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { Loading } from "@/components/ui/Loading";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { useDirectRequests } from "@/hooks/useDirectRequests";
import { useUrlParams } from "@/hooks/useUrlParams";
import { directRequestStatusLabels } from "@/utils/labels";
import { parseId } from "@/utils/parseId";
import styles from "./DirectRequestsPage.module.css";

const directRequestStatuses: DirectRequestStatus[] = [
  "PENDING",
  "PROPOSAL_SUBMITTED",
  "DECLINED",
  "VOID",
];

// Estado e página do URL; um valor que não exista é ignorado
function readDirectRequestsParams(searchParams: URLSearchParams): DirectRequestsParams {
  return {
    status: directRequestStatuses.find((s) => s === searchParams.get("status")),
    page: parseId(searchParams.get("page")) ?? undefined,
  };
}

// Todas as solicitações diretas recebidas pelo Prestador, com o filtro do estado. O filtro e a
// página ficam no URL, para o «voltar» do detalhe regressar à mesma lista.
export function DirectRequestsPage() {
  const { params, setFilters, setPage } = useUrlParams(readDirectRequestsParams);
  const requests = useDirectRequests(params);

  return (
    <div className={styles.page}>
      <title>Solicitações recebidas · LocalHub</title>
      <PageHeader title="Solicitações recebidas" />

      <div className={styles.filters}>
        <FilterSelect
          label="Estado"
          items={directRequestStatuses.map((s) => ({
            value: s,
            label: directRequestStatusLabels[s],
          }))}
          value={params.status}
          onValueChange={(status) => setFilters({ status })}
        />
      </div>

      {requests.isPending ? (
        <Loading />
      ) : requests.isError ? (
        <ErrorState
          error={requests.error}
          onRetry={requests.refetch}
          retrying={requests.isFetching}
        />
      ) : requests.data.total > 0 && requests.data.items.length === 0 ? (
        // Página que ficou vazia (ex.: respondeu à última pendente da página, filtrada por
        // «Pendente»). A paginação não aparece com uma só página, por isso há o caminho de volta.
        <EmptyState>
          Esta página já não tem solicitações.
          <Button variant="text" onClick={() => setPage(1)}>
            Ir para a primeira página
          </Button>
        </EmptyState>
      ) : requests.data.items.length === 0 ? (
        <EmptyState>
          {params.status ? "Não tem solicitações neste estado." : "Não tem solicitações."}
        </EmptyState>
      ) : (
        <div className={styles.list} data-stale={requests.isPlaceholderData || undefined}>
          <DirectRequestsTable items={requests.data.items} />
          <Pagination
            page={requests.data}
            onPageChange={setPage}
            disabled={requests.isPlaceholderData}
          />
        </div>
      )}
    </div>
  );
}
