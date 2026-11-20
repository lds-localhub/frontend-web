import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, Users } from "lucide-react";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { AdminSummary } from "@/api/types";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loading } from "@/components/ui/Loading";
import { PageHeader } from "@/components/ui/PageHeader";
import { ShortcutCard } from "@/components/ui/ShortcutCard";
import { StatCard } from "@/components/ui/StatCard";
import styles from "./AdminHomePage.module.css";

export function AdminHomePage() {
  const summary = useQuery({
    queryKey: queryKeys.admin.summary,
    queryFn: () => api<AdminSummary>("/admin/summary"),
  });

  return (
    <div className={styles.page}>
      <title>Administração · LocalHub</title>
      <PageHeader title="Administração" />

      {summary.isPending ? (
        <Loading />
      ) : summary.isError ? (
        <ErrorState error={summary.error} onRetry={summary.refetch} retrying={summary.isFetching} />
      ) : (
        <div className={styles.stats}>
          <StatCard
            value={summary.data.activeAccounts.toLocaleString("pt-PT")}
            label="Contas ativas"
          />
          <StatCard
            value={summary.data.inactiveAccounts.toLocaleString("pt-PT")}
            label="Contas desativadas"
          />
          <StatCard
            value={summary.data.activeCategories.toLocaleString("pt-PT")}
            label="Categorias ativas"
          />
        </div>
      )}

      <div className={styles.shortcuts}>
        <ShortcutCard
          to="/admin/contas"
          title="Gerir contas"
          description="Ativar ou desativar contas de Clientes e Prestadores"
          icon={Users}
        />
        <ShortcutCard
          to="/admin/categorias"
          title="Gerir categorias"
          description="Criar, editar e desativar categorias de serviço"
          icon={LayoutGrid}
          tone="warning"
        />
      </div>
    </div>
  );
}
