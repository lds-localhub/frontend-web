import type {
  ActivationStatus,
  DirectRequestStatus,
  ProposalModel,
  ProposalStatus,
  Role,
  ServiceStatus,
} from "@/api/types";

// Nomes em português dos estados e dos papéis.
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

// Tom com que o Badge mostra cada estado
export type Tone = "info" | "warning" | "success" | "danger" | "neutral" | "pending";

export const serviceStatusTone: Record<ServiceStatus, Tone> = {
  OPEN: "info",
  ASSIGNED: "warning",
  COMPLETED: "success",
  CANCELLED: "neutral",
};

export const activationStatusTone: Record<ActivationStatus, Tone> = {
  ACTIVE: "success",
  INACTIVE: "neutral",
};

// Pendente a roxo, proposta apresentada e aceite a verde, recusada a vermelho, sem efeito a cinzento
export const directRequestStatusTone: Record<DirectRequestStatus, Tone> = {
  PENDING: "pending",
  PROPOSAL_SUBMITTED: "success",
  DECLINED: "danger",
  VOID: "neutral",
};

export const proposalStatusTone: Record<ProposalStatus, Tone> = {
  PENDING: "pending",
  ACCEPTED: "success",
  DECLINED: "danger",
  VOID: "neutral",
};
