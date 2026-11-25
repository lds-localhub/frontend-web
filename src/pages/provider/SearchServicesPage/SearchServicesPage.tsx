import type { ReactNode } from "react";
import type { SearchServicesParams } from "@/api/types";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loading } from "@/components/ui/Loading";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { useSearchServices } from "@/hooks/useSearchServices";
import { useUrlParams } from "@/hooks/useUrlParams";
import { getFieldErrors } from "@/utils/errors";
import { parseId } from "@/utils/parseId";
import { SearchServicesForm } from "./SearchServicesForm";
import { ServiceResultItem } from "./ServiceResultItem";
import styles from "./SearchServicesPage.module.css";

// Categoria, «só dentro do raio» e página do URL; um valor que não seja válido é ignorado
function readSearchServicesParams(searchParams: URLSearchParams): SearchServicesParams {
  return {
    serviceCategoryId: parseId(searchParams.get("serviceCategoryId")) ?? undefined,
    withinServiceRadius: searchParams.get("withinServiceRadius") === "true" || undefined,
    page: parseId(searchParams.get("page")) ?? undefined,
  };
}

// «1 serviço aberto · …» / «4 serviços abertos · …»
function resultsCountText(total: number): string {
  const open = total === 1 ? "1 serviço aberto" : `${total} serviços abertos`;
  return `${open} · do mais próximo ao mais distante`;
}

// Pesquisa dos serviços abertos a propostas, do mais próximo para o mais distante da localização do
// perfil, com os filtros no URL
export function SearchServicesPage() {
  const { params, searchParams, setFilters, setPage } = useUrlParams(readSearchServicesParams);
  const results = useSearchServices(params);
  const hasFilters = params.serviceCategoryId !== undefined || !!params.withinServiceRadius;

  // Erros da pesquisa: os 400 com errors vão para os campos (ex.: categoria desativada entretanto);
  // os outros aparecem na zona dos resultados. Os filtros nunca desaparecem.
  const fieldErrors = getFieldErrors(results.error);

  let content: ReactNode;
  if (results.isPending) {
    content = <Loading />;
  } else if (results.isError) {
    content = fieldErrors ? null : (
      <ErrorState error={results.error} onRetry={results.refetch} retrying={results.isFetching} />
    );
  } else if (results.data.total === 0) {
    content = (
      <EmptyState>
        {hasFilters
          ? "Não há serviços abertos para estes filtros."
          : "Não há serviços abertos perto de si."}
      </EmptyState>
    );
  } else {
    const { data } = results;
    content = (
      <>
        <p className={styles.count}>{resultsCountText(data.total)}</p>
        <div className={styles.list}>
          {data.items.map((service) => (
            <ServiceResultItem key={service.serviceId} service={service} />
          ))}
        </div>
        <Pagination page={data} onPageChange={setPage} disabled={results.isPlaceholderData} />
      </>
    );
  }

  return (
    <div className={styles.page}>
      <title>Pesquisar serviços · LocalHub</title>
      <PageHeader title="Serviços perto de si" />
      <Card>
        <SearchServicesForm
          key={searchParams.toString()}
          initial={params}
          fieldErrors={fieldErrors}
          onSearch={setFilters}
        />
      </Card>
      <div className={styles.results} data-stale={results.isPlaceholderData || undefined}>
        {content}
      </div>
    </div>
  );
}
