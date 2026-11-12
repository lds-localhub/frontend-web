import type {
  ActivationStatus,
  DirectRequestStatus,
  ProposalModel,
  ProposalStatus,
  Role,
  ServiceStatus,
} from "@/api/types";

// Nomes em português dos estados e dos papéis (secção 5 da Documentação da API).
// Os ecrãs nunca mostram o valor da API (ex.: PENDING) diretamente.

export const serviceStatusLabels: Record<ServiceStatus, string> = {
  OPEN: "Aberto",
  ASSIGNED: "Atribuído",
  COMPLETED: "Realizado",
  CANCELLED: "Cancelado",
};

export const directRequestStatusLabels: Record<DirectRequestStatus, string> = {
  PENDING: "Pendente",
  PROPOSAL_SUBMITTED: "Proposta apresentada",
  DECLINED: "Recusada",
  VOID: "Sem efeito",
};

export const proposalStatusLabels: Record<ProposalStatus, string> = {
  PENDING: "Pendente",
  ACCEPTED: "Aceite",
  DECLINED: "Recusada",
  VOID: "Sem efeito",
};

export const activationStatusLabels: Record<ActivationStatus, string> = {
  ACTIVE: "Ativa",
  INACTIVE: "Desativada",
};

export const proposalModelLabels: Record<ProposalModel, string> = {
  DIRECT_REQUEST: "Solicitações diretas",
  PUBLIC: "Aberto a propostas",
};

export const roleLabels: Record<Role, string> = {
  CLIENT: "Cliente",
  PROVIDER: "Prestador de Serviços",
  ADMIN: "Administrador",
};
