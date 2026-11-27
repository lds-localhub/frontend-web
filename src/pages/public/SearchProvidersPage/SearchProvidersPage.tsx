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
import { SearchProvidersForm } from "./SearchProvidersForm";
import styles from "./SearchProvidersPage.module.css";

// Sem categoria, ou sem endereço e sem localização registada, não há pesquisa (null). Sem endereço,
// o Cliente com localização registada pesquisa a partir dela.
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

function resultsCountText(total: number): string {
  const found = total === 1 ? "1 Prestador encontrado" : `${total} Prestadores encontrados`;
  return `${found}, do mais próximo para o mais distante`;
}

// Pesquisa de Prestadores do Visitante e do Cliente, num só componente: o Visitante escreve a
// morada e vê cartões; o Cliente pode usar a localização registada e vê linhas
export function SearchProvidersPage() {
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

  // Erros da pesquisa: os 400 com errors vão para os campos do formulário (ex.: morada não
  // reconhecida); os outros aparecem na zona dos resultados. Os filtros nunca desaparecem.
  const fieldErrors = getFieldErrors(results.error);

  const form = (
    <SearchProvidersForm
      key={searchParams.toString()}
      initial={params}
      hasRegisteredLocation={hasRegisteredLocation}
      fieldErrors={fieldErrors}
      onSearch={setFilters}
    />
  );

  // Sem pesquisa, a indicação; com ela, o carregamento, o erro, o vazio ou os resultados
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
          <UserRound size={18} />
          <p>Inicie sessão como Cliente para ver o perfil completo e solicitar um serviço.</p>
          <Button to="/login">Iniciar sessão</Button>
        </div>
      )}
    </div>
  );
}
