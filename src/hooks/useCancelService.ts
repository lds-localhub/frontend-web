import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { toast } from "@/components/ui/Toast";
import { getErrorMessage, isApiError } from "@/utils/errors";

// Cancelar um serviço, pelo Cliente que o criou ou pelo Prestador com a proposta aceite. O ID do
// serviço vai no mutate, porque nas listas cada linha tem o seu.
export function useCancelService() {
  const qc = useQueryClient();
  // O estado do serviço aparece nos serviços do Cliente, nas propostas e nas solicitações do
  // Prestador e nos relatórios; invalidar uma lista que não está em cache não faz nenhum pedido
  const refresh = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.services.all, refetchType: "all" }),
      qc.invalidateQueries({ queryKey: queryKeys.proposals.all, refetchType: "all" }),
      qc.invalidateQueries({ queryKey: queryKeys.directRequests.all, refetchType: "all" }),
      qc.invalidateQueries({ queryKey: queryKeys.reports.all, refetchType: "all" }),
    ]);

  return useMutation({
    mutationFn: (serviceId: number) =>
      api<unknown>(`/services/${serviceId}/cancel`, { method: "POST" }),
    onSuccess: refresh,
    onError: (e) => {
      if (!isApiError(e) || (e.status !== 400 && e.status !== 401 && !e.errors)) {
        toast(getErrorMessage(e));
      }
      // Estado diferente no servidor (ex.: o serviço já foi cancelado pelo Cliente): atualiza o ecrã
      if (isApiError(e) && e.status === 409 && !e.errors) {
        return refresh();
      }
    },
  });
}
