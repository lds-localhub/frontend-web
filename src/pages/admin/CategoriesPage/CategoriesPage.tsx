import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { Category, List } from "@/api/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loading } from "@/components/ui/Loading";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, type Column } from "@/components/ui/Table";
import { toast } from "@/components/ui/Toast";
import { getErrorMessage, isApiError } from "@/utils/errors";
import { activationStatusLabels, activationStatusTone } from "@/utils/labels";
import { CategoryFormDialog } from "./CategoryFormDialog";
import styles from "./CategoriesPage.module.css";

export function CategoriesPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const categories = useQuery({
    queryKey: queryKeys.categories.withInactive,
    queryFn: () => api<List<Category>>("/categories?includeInactive=true"),
  });

  // A desativação muda a lista e o número de categorias ativas do início da administração
  const refresh = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.categories.all, refetchType: "all" }),
      qc.invalidateQueries({ queryKey: queryKeys.admin.all, refetchType: "all" }),
    ]);

  const deactivate = useMutation({
    mutationFn: (serviceCategoryId: number) =>
      api<unknown>(`/categories/${serviceCategoryId}/deactivate`, { method: "POST" }),
    onSuccess: refresh,
    onError: (e) => {
      if (!isApiError(e) || (e.status !== 400 && e.status !== 401 && !e.errors)) {
        toast(getErrorMessage(e));
      }
      // Categoria em uso ou já desativada: a lista passa a mostrar o estado real
      if (isApiError(e) && e.status === 409 && !e.errors) {
        return refresh();
      }
    },
  });

  if (categories.isPending) {
    return <Loading />;
  }
  if (categories.isError) {
    return (
      <ErrorState
        error={categories.error}
        onRetry={categories.refetch}
        retrying={categories.isFetching}
      />
    );
  }

  const busy = categories.isFetching || deactivate.isPending;
  const confirming = categories.data.items.find((c) => c.serviceCategoryId === confirmingId);

  const handleConfirmDeactivate = () => {
    deactivate.mutate(confirmingId!, {
      onSuccess: () => toast("Categoria desativada."),
      onSettled: () => setConfirmingId(null),
    });
  };

  const columns: Column<Category>[] = [
    { header: "Nome", cell: (c) => c.name, rowHeader: true },
    {
      header: "Estado",
      cell: (c) => (
        <Badge tone={activationStatusTone[c.status]}>{activationStatusLabels[c.status]}</Badge>
      ),
    },
    {
      header: "Ações",
      align: "end",
      cell: (c) => (
        <div className={styles.rowActions}>
          <Button
            variant="secondary"
            aria-label={`Editar ${c.name}`}
            disabled={busy}
            onClick={() => setEditing(c)}
          >
            Editar
          </Button>
          {/* Não há forma de voltar a ativar uma categoria: só as ativas se desativam */}
          {c.status === "ACTIVE" && (
            <Button
              variant="danger-outline"
              aria-label={`Desativar ${c.name}`}
              disabled={busy}
              onClick={() => setConfirmingId(c.serviceCategoryId)}
            >
              Desativar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <title>Gestão de categorias · LocalHub</title>
      <PageHeader
        title="Gestão de categorias"
        actions={<Button onClick={() => setEditing("new")}>+ Nova categoria</Button>}
      />

      <Table columns={columns} rows={categories.data.items} rowKey={(c) => c.serviceCategoryId} />

      {editing !== null && (
        <CategoryFormDialog
          key={editing === "new" ? "new" : editing.serviceCategoryId}
          category={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={confirming !== undefined}
        title={`Desativar a categoria «${confirming?.name ?? ""}»?`}
        confirmLabel="Desativar"
        danger
        pending={deactivate.isPending}
        onConfirm={handleConfirmDeactivate}
        onClose={() => setConfirmingId(null)}
      >
        <p>
          A categoria deixa de poder ser usada em perfis e em novos serviços. Esta ação não pode ser
          anulada.
        </p>
      </ConfirmDialog>
    </div>
  );
}
