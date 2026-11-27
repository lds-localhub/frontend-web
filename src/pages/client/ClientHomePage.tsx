import { PlusCircle, Search } from "lucide-react";
import { Link } from "react-router";
import type { ServicesParams } from "@/api/types";
import { ServicesTable } from "@/components/services/ServicesTable";
import { readServiceStatus, serviceStatusOptions } from "@/components/services/serviceStatusFilter";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { Loading } from "@/components/ui/Loading";
import { PageHeader } from "@/components/ui/PageHeader";
import { ShortcutCard } from "@/components/ui/ShortcutCard";
import { useMe } from "@/hooks/useMe";
import { useServices } from "@/hooks/useServices";
import { useUrlParams } from "@/hooks/useUrlParams";
import styles from "./ClientHomePage.module.css";

// Só o estado vem do URL; os 5 mais recentes são fixos e não vão para o URL
function readRecentServicesParams(searchParams: URLSearchParams): ServicesParams {
  return { status: readServiceStatus(searchParams), pageSize: 5 };
}

// Início do Cliente: atalhos para pesquisar Prestadores e criar um serviço, e os serviços mais
// recentes, com o filtro do estado
export function ClientHomePage() {
  const { data: me } = useMe();
  const { params, setFilters } = useUrlParams(readRecentServicesParams);
  const services = useServices(params);

  return (
    <div className={styles.page}>
      <title>Início · LocalHub</title>
      <PageHeader title={`Olá, ${me?.name.split(" ")[0] ?? ""}`} />

      <div className={styles.shortcuts}>
        <ShortcutCard
          to="/pesquisa/prestadores"
          title="Pesquisar Prestadores"
          description="Por categoria e localização"
          icon={Search}
        />
        <ShortcutCard
          to="/servicos/novo"
          title="Criar serviço"
          description="Solicitação direta ou aberto a propostas"
          icon={PlusCircle}
          tone="info"
        />
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Serviços recentes</h2>
          <Link to="/servicos" className={styles.seeAll}>
            Ver todos ›
          </Link>
        </div>
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
        ) : services.data.items.length === 0 ? (
          <EmptyState>
            {params.status ? "Não tem serviços neste estado." : "Ainda não criou serviços."}
          </EmptyState>
        ) : (
          <div className={styles.list} data-stale={services.isPlaceholderData || undefined}>
            <ServicesTable items={services.data.items} />
          </div>
        )}
      </section>
    </div>
  );
}
