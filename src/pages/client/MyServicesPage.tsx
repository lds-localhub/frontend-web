import { Plus } from "lucide-react";
import { useState } from "react";
import type { ServiceItem, ServicesParams } from "@/api/types";
import { cancelServiceText } from "@/components/services/serviceConfirmTexts";
import { ServicesTable } from "@/components/services/ServicesTable";
import { readServiceStatus, serviceStatusOptions } from "@/components/services/serviceStatusFilter";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { Loading } from "@/components/ui/Loading";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { toast } from "@/components/ui/Toast";
import { useCancelService } from "@/hooks/useCancelService";
import { useServices } from "@/hooks/useServices";
import { useUrlParams } from "@/hooks/useUrlParams";
import { parseId } from "@/utils/parseId";
import styles from "./MyServicesPage.module.css";

// Estado e página do URL; um valor que não exista é ignorado
function readServicesParams(searchParams: URLSearchParams): ServicesParams {
  return {
    status: readServiceStatus(searchParams),
    page: parseId(searchParams.get("page")) ?? undefined,
  };
}

export function MyServicesPage() {
  const { params, setFilters, setPage } = useUrlParams(readServicesParams);
  const services = useServices(params);
  const cancel = useCancelService();
  // Serviço cuja confirmação de cancelamento está aberta
  const [confirming, setConfirming] = useState<ServiceItem | null>(null);

  const handleConfirm = () => {
    if (!confirming) {
      return;
    }
    cancel.mutate(confirming.serviceId, {
      onSuccess: () => toast("Serviço cancelado."),
      onSettled: () => setConfirming(null),
    });
  };

  return (
    <div className={styles.page}>
      <title>Os meus serviços · LocalHub</title>
      <PageHeader
        title="Os meus serviços"
        actions={
          <Button to="/servicos/novo">
            <Plus size={16} aria-hidden="true" />
            Criar serviço
          </Button>
        }
      />

      <div className={styles.filters}>
        <FilterSelect
          label="Estado"
          items={serviceStatusOptions}
          value={params.status}
          onValueChange={(status) => setFilters({ status })}
        />
      </div>

      {services.isPending ? (
        <Loading />
      ) : services.isError ? (
        <ErrorState
          error={services.error}
          onRetry={services.refetch}
          retrying={services.isFetching}
        />
      ) : services.data.items.length === 0 && services.data.total > 0 ? (
        // Página que ficou vazia (ex.: cancelou o último serviço da página com o filtro «Aberto»):
        // o Pagination não aparece com uma só página, por isso dá-se o caminho de volta
        <EmptyState>
          Esta página já não tem serviços.{" "}
          <Button variant="text" onClick={() => setPage(1)}>
            Ir para a primeira página
          </Button>
        </EmptyState>
      ) : services.data.items.length === 0 ? (
        <EmptyState>
          {params.status ? "Não tem serviços neste estado." : "Ainda não criou serviços."}
        </EmptyState>
      ) : (
        <div className={styles.list} data-stale={services.isPlaceholderData || undefined}>
          <ServicesTable
            items={services.data.items}
            detailed
            onCancel={setConfirming}
            disabled={cancel.isPending}
          />
          <Pagination
            page={services.data}
            onPageChange={setPage}
            disabled={services.isPlaceholderData}
          />
        </div>
      )}

      <ConfirmDialog
        open={confirming !== null}
        title={`Cancelar o serviço «${confirming?.title ?? ""}»?`}
        confirmLabel="Cancelar serviço"
        onConfirm={handleConfirm}
        onClose={() => setConfirming(null)}
        pending={cancel.isPending}
        danger
      >
        <p>{confirming && cancelServiceText(confirming.status)}</p>
      </ConfirmDialog>
    </div>
  );
}
