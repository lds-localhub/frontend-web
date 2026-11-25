import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { ProposalInput } from "@/api/types";
import { toast } from "@/components/ui/Toast";
import { getErrorMessage, isApiError } from "@/utils/errors";

// Apresentar uma proposta a um serviço, numa solicitação direta ou num serviço aberto a propostas.
// O ID do serviço vai no mutate, porque só é conhecido depois de o ecrã ler o serviço.
export function useSubmitProposal() {
  const qc = useQueryClient();
  // A solicitação passa a ter proposta, a proposta nova entra nas do Prestador e o serviço pesquisado
  // passa a indicar a proposta já apresentada
  const refresh = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.directRequests.all, refetchType: "all" }),
      qc.invalidateQueries({ queryKey: queryKeys.proposals.all, refetchType: "all" }),
      qc.invalidateQueries({ queryKey: queryKeys.searchServices.all, refetchType: "all" }),
    ]);

  return useMutation({
    mutationFn: ({ serviceId, body }: { serviceId: number; body: ProposalInput }) =>
      api<unknown>(`/services/${serviceId}/proposals`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: refresh,
    onError: (e) => {
      // Os erros de campo e o 400 são mostrados no formulário
      if (!isApiError(e) || (e.status !== 400 && e.status !== 401 && !e.errors)) {
        toast(getErrorMessage(e));
      }
      // Estado diferente no servidor (ex.: o Cliente já aceitou outra proposta): atualiza o ecrã
      if (isApiError(e) && e.status === 409 && !e.errors) {
        return refresh();
      }
    },
  });
}
