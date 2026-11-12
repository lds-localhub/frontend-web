// Tipos da API do LocalHub: cópia em TypeScript da Documentação da API v04.
// Os instantes ("2026-10-08T18:00:00Z") e as datas sem hora ("2026-10-13") ficam como string;
// só são convertidos na apresentação, com as funções de utils/format.ts (secção 4.3).

// ---------------------------------------------------------------------------
// Estados e papéis (secção 5)
// ---------------------------------------------------------------------------

export type Role = "CLIENT" | "PROVIDER" | "ADMIN";
export type ActivationStatus = "ACTIVE" | "INACTIVE";
export type ServiceStatus = "OPEN" | "ASSIGNED" | "COMPLETED" | "CANCELLED";
export type DirectRequestStatus = "PENDING" | "PROPOSAL_SUBMITTED" | "DECLINED" | "VOID";
export type ProposalStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "VOID";
export type ProposalModel = "DIRECT_REQUEST" | "PUBLIC";

// ---------------------------------------------------------------------------
// Listas (secção 4.4) e erros (secção 4.6)
// ---------------------------------------------------------------------------

export type Page<T> = { page: number; pageSize: number; total: number; items: T[] }; // listas paginadas
export type List<T> = { total: number; items: T[] }; // listas sem paginação

export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: Record<string, string[]>; // só nos 400 com erros por campo
};

// Tipos próprios do LocalHub (prefixo https://localhub.local/erros/, secção 4.6)
export type LocalHubErrorType =
  | "credenciais-invalidas"
  | "conta-desativada"
  | "perfil-em-falta"
  | "transicao-invalida"
  | "prestador-inativo"
  | "avaliacao-existente"
  | "administracao-so-web";

// ---------------------------------------------------------------------------
// Partes repetidas
// ---------------------------------------------------------------------------

export type CategoryRef = { serviceCategoryId: number; name: string };

export type ProfessionalProfileRef = { professionalProfileId: number; name: string };

export type ProfessionalProfileSummary = ProfessionalProfileRef & {
  averageRating: number | null;
  reviewCount: number;
};

// ---------------------------------------------------------------------------
// F001 — Registo, autenticação e autorização
// ---------------------------------------------------------------------------

// E04 (e user do E02)
export type Me = {
  userId: number;
  name: string;
  email: string;
  role: Role;
  address: string | null;
  professionalProfileId: number | null;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: "CLIENT" | "PROVIDER";
}; // E01
export type LoginInput = { email: string; password: string; client: "WEB" }; // E02
export type LoginResult = { token: string; user: Me }; // E02
export type ChangePasswordInput = { currentPassword: string; newPassword: string }; // E40

// ---------------------------------------------------------------------------
// F002 — Gestão de contas
// ---------------------------------------------------------------------------

// Campos de cada alerta: só aparecem no tipo de alerta a que dizem respeito (secção 4.3)
export type AccountAlert = {
  type: "ASSIGNED_CANCELLATIONS" | "LOW_AVERAGE_RATING";
  count?: number;
  total?: number;
  averageRating?: number;
  reviewCount?: number;
};

// E05
export type Account = {
  userId: number;
  name: string;
  email: string;
  role: "CLIENT" | "PROVIDER";
  status: ActivationStatus;
  alerts: AccountAlert[];
};

export type ResetPasswordResult = { temporaryPassword: string }; // E41

// E39
export type AdminSummary = {
  activeAccounts: number;
  inactiveAccounts: number;
  activeCategories: number;
};

// ---------------------------------------------------------------------------
// F003 — Categorias
// ---------------------------------------------------------------------------

export type Category = CategoryRef & { status: ActivationStatus }; // E08
export type CategoryInput = { name: string }; // E09, E10

// ---------------------------------------------------------------------------
// F004 e F015 — Perfil profissional e localização
// ---------------------------------------------------------------------------

// E12, E13, E14
export type Profile = {
  professionalProfileId: number;
  serviceProviderId: number;
  name: string;
  introduction: string;
  contactDetails: string;
  experience: string;
  serviceCategories: CategoryRef[];
  address: string;
  serviceRadiusKm: number;
  averageRating: number | null;
  reviewCount: number;
};

// E12, E14
export type ProfileInput = {
  introduction: string;
  contactDetails: string;
  experience: string;
  serviceCategoryIds: number[];
  address: string;
  serviceRadiusKm: number;
};

// E15
export type Review = {
  reviewId: number;
  rating: number;
  comment: string | null;
  clientName: string;
  creationDate: string;
};

export type LocationInput = { address: string }; // E16

// ---------------------------------------------------------------------------
// F005 e F006 — Pesquisas
// ---------------------------------------------------------------------------

// E18
export type ProviderSearchItem = {
  professionalProfileId: number;
  name: string;
  serviceCategories: CategoryRef[];
  averageRating: number | null;
  reviewCount: number;
  distanceKm: number;
  serviceRadiusKm: number;
  withinServiceRadius: boolean;
};

// E19
export type SearchServiceItem = {
  serviceId: number;
  title: string;
  serviceCategory: CategoryRef;
  description: string;
  location: string;
  distanceKm: number;
  withinServiceRadius: boolean;
  requestedStartDate: string;
  requestedEndDate: string | null;
  creationDate: string;
};

// E38
export type SearchServiceDetail = SearchServiceItem & { myProposalId: number | null };

// ---------------------------------------------------------------------------
// F007 a F010 — Serviços, solicitações diretas e propostas
// ---------------------------------------------------------------------------

// E20
export type ServiceInput = {
  proposalModel: ProposalModel;
  serviceCategoryId: number;
  title: string;
  description: string;
  requestedStartDate: string;
  requestedEndDate: string | null;
  location: string;
  professionalProfileIds: number[] | null;
};

// E21
export type ServiceItem = {
  serviceId: number;
  title: string;
  proposalModel: ProposalModel;
  serviceCategory: CategoryRef;
  status: ServiceStatus;
  creationDate: string;
  directRequestsCount: number;
  proposalsCount: number;
  pendingProposalsCount: number;
  assignedProvider: ProfessionalProfileRef | null;
  reviewed: boolean;
};

// Alteração de estado do serviço (E22)
export type ServiceHistoryEntry = {
  previousStatus: ServiceStatus;
  newStatus: ServiceStatus;
  changedAt: string;
  changedByUserId: number;
  changedByName: string;
  changedByRole: "CLIENT" | "PROVIDER";
};

// Proposta dentro de uma solicitação direta (E22)
export type ServiceDirectRequestProposal = {
  proposalId: number;
  amount: number;
  conditions: string;
  obs: string | null;
  status: ProposalStatus;
  creationDate: string;
  decisionDate: string | null;
};

// Solicitação direta de um serviço (E22)
export type ServiceDirectRequest = {
  directRequestId: number;
  status: DirectRequestStatus;
  creationDate: string;
  responseDate: string | null;
  professionalProfile: ProfessionalProfileSummary;
  proposal: ServiceDirectRequestProposal | null;
};

// Proposta de um trabalho publicado (E22)
export type ServiceProposal = ServiceDirectRequestProposal & {
  professionalProfile: ProfessionalProfileSummary;
};

// E22 (e resposta do E20)
export type ServiceDetail = {
  serviceId: number;
  title: string;
  proposalModel: ProposalModel;
  serviceCategory: CategoryRef;
  description: string;
  location: string;
  requestedStartDate: string;
  requestedEndDate: string | null;
  status: ServiceStatus;
  creationDate: string;
  actualCompletionDate: string | null;
  clientName: string;
  reviewed: boolean;
  history: ServiceHistoryEntry[];
  directRequests: ServiceDirectRequest[];
  proposals: ServiceProposal[];
};

// E23
export type DirectRequestItem = {
  directRequestId: number;
  status: DirectRequestStatus;
  proposalId: number | null;
  service: {
    serviceId: number;
    title: string;
    serviceCategory: CategoryRef;
    requestedStartDate: string;
    requestedEndDate: string | null;
    clientName: string;
  };
};

// E36
export type DirectRequestDetail = {
  directRequestId: number;
  status: DirectRequestStatus;
  creationDate: string;
  responseDate: string | null;
  service: {
    serviceId: number;
    title: string;
    serviceCategory: CategoryRef;
    description: string;
    location: string;
    distanceKm: number;
    requestedStartDate: string;
    requestedEndDate: string | null;
    status: ServiceStatus;
    creationDate: string;
    clientName: string;
    history: Pick<
      ServiceHistoryEntry,
      "previousStatus" | "newStatus" | "changedAt" | "changedByRole"
    >[];
  };
  proposalId: number | null;
};

// E25 (obs opcional: não é enviado quando vazio)
export type ProposalInput = { amount: number; conditions: string; obs?: string };

// E27
export type ProposalItem = {
  proposalId: number;
  amount: number;
  status: ProposalStatus;
  service: {
    serviceId: number;
    title: string;
    serviceCategory: CategoryRef;
    requestedStartDate: string;
    requestedEndDate: string | null;
    status: ServiceStatus;
    clientName: string;
  };
};

// E37
export type ProposalDetail = {
  proposalId: number;
  amount: number;
  conditions: string;
  obs: string | null;
  status: ProposalStatus;
  creationDate: string;
  decisionDate: string | null;
  service: {
    serviceId: number;
    title: string;
    proposalModel: ProposalModel;
    serviceCategory: CategoryRef;
    description: string;
    location: string;
    distanceKm: number;
    requestedStartDate: string;
    requestedEndDate: string | null;
    status: ServiceStatus;
    creationDate: string;
    clientName: string;
  };
};

// E32 (comment opcional: não é enviado quando vazio)
export type ReviewInput = { rating: number; comment?: string };

// ---------------------------------------------------------------------------
// F013 e F014 — Relatórios
// ---------------------------------------------------------------------------

export type CategoryCount = CategoryRef & { count: number };
export type StatusCount = { status: Exclude<ServiceStatus, "OPEN">; count: number };

// E33
export type ClientReport = {
  contractedServices: number;
  byCategory: CategoryCount[];
  byStatus: StatusCount[];
  totalAcceptedAmount: number;
  completedHistory: {
    serviceId: number;
    actualCompletionDate: string;
    serviceCategory: CategoryRef;
    providerName: string;
    amount: number;
  }[];
};

// E34
export type ProviderReport = {
  completedServices: number;
  byCategory: CategoryCount[];
  byStatus: StatusCount[];
  directRequestsReceived: number;
  proposals: { accepted: number; declined: number };
  totalAcceptedAmount: number;
  ratingEvolution: { month: string; reviewCount: number; averageRating: number | null }[];
};

// ---------------------------------------------------------------------------
// Parâmetros de query (linha «Parâmetros (query)» de cada endpoint)
// ---------------------------------------------------------------------------

type Paging = { page?: number; pageSize?: number }; // secção 4.4

export type AccountsParams = Paging & { role?: "CLIENT" | "PROVIDER"; status?: ActivationStatus }; // E05
export type ReviewsParams = Paging; // E15
export type SearchProvidersParams = Paging & {
  serviceCategoryId: number;
  address?: string;
  name?: string;
}; // E18
export type SearchServicesParams = Paging & {
  serviceCategoryId?: number;
  withinServiceRadius?: boolean;
}; // E19
export type ServicesParams = Paging & { status?: ServiceStatus }; // E21
export type DirectRequestsParams = Paging & { status?: DirectRequestStatus }; // E23
export type ProposalsParams = Paging & { status?: ProposalStatus }; // E27
export type ReportParams = { startDate?: string; endDate?: string }; // E33, E34 (AAAA-MM-DD)
