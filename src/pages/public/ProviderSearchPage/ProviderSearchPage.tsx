import { UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { Navigate } from "react-router";
import type { SearchProvidersParams } from "@/api/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loading } from "@/components/ui/Loading";
import { Pagination } from "@/components/ui/Pagination";
import { useMe } from "@/hooks/useMe";
import { useSearchProviders } from "@/hooks/useSearchProviders";
import { useUrlParams } from "@/hooks/useUrlParams";
import { getFieldErrors } from "@/utils/errors";
import { homeOf } from "@/utils/homeOf";
import { parseId } from "@/utils/parseId";
import { ProviderResultCard } from "./ProviderResultCard";
import { ProviderResultRow } from "./ProviderResultRow";
import { ProviderSearchForm } from "./ProviderSearchForm";
import styles from "./ProviderSearchPage.module.css";

// Sem categoria, ou sem endereço e sem localização registada → null: sem pedido;
// sem endereço, o Cliente com localização registada pesquisa a partir dela (E18)
function readSearchProvidersParams(
  searchParams: URLSearchParams,
  hasRegisteredLocation: boolean,
): SearchProvidersParams | null {
  const serviceCategoryId = parseId(searchParams.get("serviceCategoryId"));
  const address = searchParams.get("address")?.trim() || undefined;
  if (serviceCategoryId === null || (!hasRegisteredLocation && !address)) {
    return null;
  }
  return { serviceCategoryId, address, page: parseId(searchParams.get("page")) ?? undefined };
}

// «1 Prestador encontrado, …» / «3 Prestadores encontrados, …»
function resultsCountText(total: number): string {
  const found = total === 1 ? "1 Prestador encontrado" : `${total} Prestadores encontrados`;
  return `${found}, do mais próximo para o mais distante`;
}

// W01 (Visitante) e W11 (Cliente): um só componente (RF-F005-01, RF-F005-02)
export function ProviderSearchPage() {
  const { data: me } = useMe();
  const isClient = me?.role === "CLIENT";
  const hasRegisteredLocation = isClient && !!me.address;
  const { params, searchParams, setFilters, setPage } = useUrlParams((sp) =>
    readSearchProvidersParams(sp, hasRegisteredLocation),
  );
  const results = useSearchProviders(params);

  // A pesquisa de Prestadores só existe para o Visitante e para o Cliente
  if (me && me.role !== "CLIENT") {
    return <Navigate to={homeOf(me.role)} replace />;
  }

  // Erros da pesquisa (8.5.3): os 400 com errors vão para os campos do formulário (ex.: morada não
  // reconhecida); os outros aparecem na zona dos resultados. Os filtros nunca desaparecem.
  const fieldErrors = params ? getFieldErrors(results.error) : undefined;

  const form = (
    <ProviderSearchForm
      key={searchParams.toString()}
      initial={params}
      hasRegisteredLocation={hasRegisteredLocation}
      fieldErrors={fieldErrors}
      onSearch={setFilters}
    />
  );

  // o que aparece nos resultados nas diferentes situações
  let content: ReactNode;
  if (!params) {
    content = <p className={styles.hint}>Escolha a categoria e a localização para pesquisar.</p>;
  } else if (results.isPending) {
    content = <Loading />;
  } else if (results.isError) {
    content = fieldErrors ? null : (
      <ErrorState error={results.error} onRetry={results.refetch} retrying={results.isFetching} />
    );
  } else if (results.data.total === 0) {
    content = <EmptyState>Não foram encontrados Prestadores para esta categoria.</EmptyState>;
  } else {
    const { data } = results;
    content = (
      <>
        <p className={styles.count}>{resultsCountText(data.total)}</p>
        {isClient ? (
          <div className={styles.list}>
            {data.items.map((item) => (
              <ProviderResultRow key={item.professionalProfileId} result={item} />
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            {data.items.map((item) => (
              <ProviderResultCard key={item.professionalProfileId} result={item} />
            ))}
          </div>
        )}
        <Pagination page={data} onPageChange={setPage} disabled={results.isPlaceholderData} />
      </>
    );
  }

  return (
    <div className={styles.page}>
      <title>Pesquisar Prestadores · LocalHub</title>
      {isClient ? (
        <>
          <h1>Pesquisar Prestadores</h1>
          <Card>{form}</Card>
        </>
      ) : (
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Serviços para o lar, perto de si</p>
          <h1 className={styles.heroTitle}>Pesquisar Prestadores</h1>
          <div className={styles.heroForm}>{form}</div>
        </section>
      )}
      <div className={styles.results} data-stale={results.isPlaceholderData || undefined}>
        {content}
      </div>
      {!isClient && (
        <div className={styles.signIn}>
          <UserRound size={18} aria-hidden="true" />
          <p>Inicie sessão como Cliente para ver o perfil completo e solicitar um serviço.</p>
          <Button to="/login">Iniciar sessão</Button>
        </div>
      )}
    </div>
  );
}
