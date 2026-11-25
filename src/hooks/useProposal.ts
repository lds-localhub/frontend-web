import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { ProposalDetail } from "@/api/types";

// Proposta apresentada pelo Prestador, com o resumo do serviço: no detalhe da proposta e no serviço
// pesquisado, depois de a enviar. Sem ID, não faz o pedido.
export const useProposal = (id: number | null) =>
  useQuery({
    queryKey: queryKeys.proposals.detail(id!),
    queryFn: () => api<ProposalDetail>(`/proposals/${id}`),
    enabled: id !== null,
  });
