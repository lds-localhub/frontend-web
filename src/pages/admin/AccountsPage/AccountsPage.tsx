import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { api, toQueryString } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type {
  Account,
  AccountsParams,
  ActivationStatus,
  Page,
  ResetPasswordResult,
} from "@/api/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { Loading } from "@/components/ui/Loading";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { Table, type Column } from "@/components/ui/Table";
import { toast } from "@/components/ui/Toast";
import { useUrlParams } from "@/hooks/useUrlParams";
import { getErrorMessage, isApiError } from "@/utils/errors";
import { activationStatusLabels, activationStatusTone, roleLabels } from "@/utils/labels";
import { parseId } from "@/utils/parseId";
import { AccountAlerts } from "./AccountAlerts";
import { TemporaryPasswordDialog } from "./TemporaryPasswordDialog";
import styles from "./AccountsPage.module.css";

type AccountRole = NonNullable<AccountsParams["role"]>;
const accountRoles: AccountRole[] = ["CLIENT", "PROVIDER"];
const activationStatuses: ActivationStatus[] = ["ACTIVE", "INACTIVE"];

// Papel, estado e página do URL; um valor que não exista é ignorado
function readAccountsParams(searchParams: URLSearchParams): AccountsParams {
  return {
    role: accountRoles.find((r) => r === searchParams.get("role")),
    status: activationStatuses.find((s) => s === searchParams.get("status")),
    page: parseId(searchParams.get("page")) ?? undefined,
  };
}

// Janela de confirmação aberta: que ação e para que conta (só o ID; a conta vem da lista)
type Confirming = { action: "deactivate" | "reset"; userId: number } | null;

export function AccountsPage() {
  const qc = useQueryClient();
  const { params, setFilters, setPage } = useUrlParams(readAccountsParams);
  const [confirming, setConfirming] = useState<Confirming>(null);

  const accounts = useQuery({
    queryKey: queryKeys.accounts.list(params),
    queryFn: () => api<Page<Account>>(`/accounts?${toQueryString(params)}`),
    placeholderData: keepPreviousData,
  });

  // Ativar e desativar mudam o estado na lista e os totais de contas do início da administração
  const refresh = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all, refetchType: "all" }),
      qc.invalidateQueries({ queryKey: queryKeys.admin.all, refetchType: "all" }),
    ]);

  const handleActionError = (e: unknown) => {
    if (!isApiError(e) || (e.status !== 400 && e.status !== 401 && !e.errors)) {
      toast(getErrorMessage(e));
    }
    // Ex.: a conta já estava desativada: a lista passa a mostrar o estado real
    if (isApiError(e) && e.status === 409 && !e.errors) {
      return refresh();
    }
  };

  const deactivate = useMutation({
    mutationFn: (userId: number) =>
      api<unknown>(`/accounts/${userId}/deactivate`, { method: "POST" }),
    onSuccess: refresh,
    onError: handleActionError,
  });

  const activate = useMutation({
    mutationFn: (userId: number) =>
      api<unknown>(`/accounts/${userId}/activate`, { method: "POST" }),
    onSuccess: refresh,
    onError: handleActionError,
  });

  // A redefinição não muda nada na lista: só devolve a palavra-passe temporária, mostrada uma vez
  const reset = useMutation({
    mutationFn: (userId: number) =>
      api<ResetPasswordResult>(`/accounts/${userId}/reset-password`, { method: "POST" }),
    onError: handleActionError,
  });

  const handleConfirm = () => {
    if (!confirming) {
      return;
    }
    if (confirming.action === "deactivate") {
      deactivate.mutate(confirming.userId, {
        onSuccess: () => toast("Conta desativada."),
        onSettled: () => setConfirming(null),
      });
    } else {
      reset.mutate(confirming.userId, { onSettled: () => setConfirming(null) });
    }
  };

  const handleActivateClick = (userId: number) =>
    activate.mutate(userId, { onSuccess: () => toast("Conta ativada.") });

  const items = accounts.data?.items ?? [];
  const confirmingAccount = items.find((a) => a.userId === confirming?.userId);
  const resetAccount = items.find((a) => a.userId === reset.variables);
  const busy = accounts.isFetching || deactivate.isPending || activate.isPending || reset.isPending;
  const hasFilters = params.role !== undefined || params.status !== undefined;

  const columns: Column<Account>[] = [
    { header: "Nome", cell: (a) => a.name, rowHeader: true },
    { header: "E-mail", cell: (a) => a.email },
    { header: "Papel", cell: (a) => roleLabels[a.role] },
    {
      header: "Estado",
      cell: (a) => (
        <Badge tone={activationStatusTone[a.status]}>{activationStatusLabels[a.status]}</Badge>
      ),
    },
    { header: "Alertas", cell: (a) => <AccountAlerts alerts={a.alerts} /> },
    {
      header: "Ações",
      cell: (a) => (
        <div className={styles.rowActions}>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => setConfirming({ action: "reset", userId: a.userId })}
          >
            Redefinir palavra-passe
          </Button>
          {a.status === "ACTIVE" ? (
            <Button
              variant="danger-outline"
              disabled={busy}
              onClick={() => setConfirming({ action: "deactivate", userId: a.userId })}
            >
              Desativar
            </Button>
          ) : (
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => handleActivateClick(a.userId)}
            >
              Ativar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <title>Gestão de contas · LocalHub</title>
      <PageHeader title="Gestão de contas" />

      <div className={styles.filters}>
        <FilterSelect
          label="Papel"
          items={accountRoles.map((r) => ({ value: r, label: roleLabels[r] }))}
          value={params.role}
          onValueChange={(role) => setFilters({ ...params, role, page: undefined })}
        />
        <FilterSelect
          label="Estado"
          items={activationStatuses.map((s) => ({ value: s, label: activationStatusLabels[s] }))}
          value={params.status}
          onValueChange={(status) => setFilters({ ...params, status, page: undefined })}
        />
      </div>

      {accounts.isPending ? (
        <Loading />
      ) : accounts.isError ? (
        <ErrorState
          error={accounts.error}
          onRetry={accounts.refetch}
          retrying={accounts.isFetching}
        />
      ) : items.length === 0 ? (
        <EmptyState>
          {hasFilters ? "Não há contas para estes filtros." : "Não há contas."}
        </EmptyState>
      ) : (
        <div className={styles.list} data-stale={accounts.isPlaceholderData || undefined}>
          <Table columns={columns} rows={items} rowKey={(a) => a.userId} />
          <Pagination
            page={accounts.data}
            onPageChange={setPage}
            disabled={accounts.isPlaceholderData}
          />
        </div>
      )}

      <ConfirmDialog
        open={confirming?.action === "deactivate" && confirmingAccount !== undefined}
        title={`Desativar a conta de ${confirmingAccount?.name ?? ""}?`}
        confirmLabel="Desativar"
        danger
        pending={deactivate.isPending}
        onConfirm={handleConfirm}
        onClose={() => setConfirming(null)}
      >
        <p>
          A conta deixa de poder iniciar sessão e as sessões abertas são terminadas. Os serviços, as
          propostas e as avaliações da conta mantêm-se. Pode voltar a ativá-la depois.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirming?.action === "reset" && confirmingAccount !== undefined}
        title={`Redefinir a palavra-passe de ${confirmingAccount?.name ?? ""}?`}
        confirmLabel="Redefinir"
        icon={KeyRound}
        pending={reset.isPending}
        onConfirm={handleConfirm}
        onClose={() => setConfirming(null)}
      >
        <div className={styles.confirmText}>
          <p>
            É gerada uma palavra-passe temporária e todas as sessões da conta são terminadas. A
            palavra-passe atual deixa de funcionar e o estado da conta não é alterado.
          </p>
          <Callout tone="warning">
            Redefina apenas a pedido do titular, feito ao suporte a partir do e-mail registado na
            conta: <strong>{confirmingAccount?.email}</strong>.
          </Callout>
        </div>
      </ConfirmDialog>

      <TemporaryPasswordDialog
        accountName={resetAccount?.name ?? ""}
        temporaryPassword={reset.data?.temporaryPassword}
        onClose={() => reset.reset()}
      />
    </div>
  );
}
