import type { ProposalModel, ServiceStatus } from "@/api/types";

// Consequências das decisões do Cliente, mostradas nas janelas de confirmação

// Cancelar: aberto, as respostas pendentes ficam sem efeito; atribuído, fica no histórico
export function cancelServiceText(status: ServiceStatus): string {
  return status === "OPEN"
    ? "O serviço passa a cancelado e as propostas e solicitações ainda pendentes ficam sem efeito. Esta ação não pode ser anulada."
    : "O serviço passa a cancelado e o cancelamento fica registado no histórico. Esta ação não pode ser anulada.";
}

// Aceitar: nas solicitações diretas, também as solicitações sem resposta ficam sem efeito
export function acceptProposalText(model: ProposalModel): string {
  return model === "DIRECT_REQUEST"
    ? "O serviço passa a atribuído, as restantes propostas pendentes passam a recusadas e as solicitações ainda sem resposta ficam sem efeito. Esta ação não pode ser anulada."
    : "O serviço passa a atribuído e as restantes propostas pendentes passam a recusadas. Esta ação não pode ser anulada.";
}

export const declineProposalText =
  "A proposta passa a recusada e não pode voltar a ser aceite. O serviço continua aberto. Esta ação não pode ser anulada.";

export const completeServiceText =
  "O serviço passa a realizado e já não pode ser cancelado. Depois, pode avaliar o Prestador. Esta ação não pode ser anulada.";
