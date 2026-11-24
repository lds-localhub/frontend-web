import { Navigate } from "react-router";
import type { SearchProvidersParams } from "@/api/types";
import { Card } from "@/components/ui/Card";
import { useMe } from "@/hooks/useMe";
import { useUrlParams } from "@/hooks/useUrlParams";
import { homeOf } from "@/utils/homeOf";
import { parseId } from "@/utils/parseId";
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

// W01 (Visitante) e W11 (Cliente): um só componente
export function ProviderSearchPage() {
  const { data: me } = useMe();
  const isClient = me?.role === "CLIENT";
  const hasRegisteredLocation = isClient && !!me.address;
  const { params, searchParams, setFilters } = useUrlParams((sp) =>
    readSearchProvidersParams(sp, hasRegisteredLocation),
  );

  // A pesquisa de Prestadores só existe para o Visitante e para o Cliente
  if (me && me.role !== "CLIENT") {
    return <Navigate to={homeOf(me.role)} replace />;
  }

  const form = (
    <ProviderSearchForm
      key={searchParams.toString()}
      initial={params}
      hasRegisteredLocation={hasRegisteredLocation}
      fieldErrors={undefined}
      onSearch={setFilters}
    />
  );

  return (
    <>
      <title>Pesquisar Prestadores · LocalHub</title>
      {isClient ? (
        <div className={styles.client}>
          <h1>Pesquisar Prestadores</h1>
          <Card>{form}</Card>
        </div>
      ) : (
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Serviços para o lar, perto de si</p>
          <h1 className={styles.heroTitle}>Pesquisar Prestadores</h1>
          <div className={styles.heroForm}>{form}</div>
        </section>
      )}
    </>
  );
}
