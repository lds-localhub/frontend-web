// Tipos dos pedidos e das respostas da API do LocalHub.
// Os instantes ("2026-10-08T18:00:00Z") e as datas sem hora ("2026-10-13") ficam como string;
// só são convertidos na apresentação, com as funções de utils/format.ts.

// ---------------------------------------------------------------------------
// Estados e papéis
// ---------------------------------------------------------------------------

export type Role = "CLIENT" | "PROVIDER" | "ADMIN";
export type ActivationStatus = "ACTIVE" | "INACTIVE";
export type ServiceStatus = "OPEN" | "ASSIGNED" | "COMPLETED" | "CANCELLED";
export type DirectRequestStatus = "PENDING" | "PROPOSAL_SUBMITTED" | "DECLINED" | "VOID";
export type ProposalStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "VOID";
export type ProposalModel = "DIRECT_REQUEST" | "PUBLIC";

// ---------------------------------------------------------------------------
// Listas e erros
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

// Tipos próprios do LocalHub (prefixo https://localhub.local/erros/)
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
// Registo, autenticação e autorização
// ---------------------------------------------------------------------------

// Utilizador autenticado (também é o user da resposta do início de sessão)
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
};
export type LoginInput = { email: string; password: string; client: "WEB" };
export type LoginResult = { token: string; user: Me };
export type ChangePasswordInput = { currentPassword: string; newPassword: string };

// ---------------------------------------------------------------------------
// Gestão de contas
// ---------------------------------------------------------------------------

// Cada alerta só traz os campos do seu tipo: depois de verificar o type,
// o TypeScript sabe que campos existem
export type AccountAlert =
  | { type: "ASSIGNED_CANCELLATIONS"; count: number; total: number }
  | { type: "LOW_AVERAGE_RATING"; averageRating: number; reviewCount: number };

export type Account = {
  userId: number;
  name: string;
  email: string;
  role: "CLIENT" | "PROVIDER";
  status: ActivationStatus;
  alerts: AccountAlert[];
};

export type ResetPasswordResult = { temporaryPassword: string };

export type AdminSummary = {
  activeAccounts: number;
  inactiveAccounts: number;
  activeCategories: number;
};

// ---------------------------------------------------------------------------
// Categorias
// ---------------------------------------------------------------------------

export type Category = CategoryRef & { status: ActivationStatus };
export type CategoryInput = { name: string };

// ---------------------------------------------------------------------------
// Perfil profissional e localização
// ---------------------------------------------------------------------------

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

export type ProfileInput = {
  introduction: string;
  contactDetails: string;
  experience: string;
  serviceCategoryIds: number[];
  address: string;
  serviceRadiusKm: number;
};

export type Review = {
  reviewId: number;
  rating: number;
  comment: string | null;
  clientName: string;
  creationDate: string;
};

export type LocationInput = { address: string };

// ---------------------------------------------------------------------------
// Pesquisas
// ---------------------------------------------------------------------------

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

export type SearchServiceDetail = SearchServiceItem & { myProposalId: number | null };

// ---------------------------------------------------------------------------
// Serviços, solicitações diretas e propostas
// ---------------------------------------------------------------------------

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

// Alteração de estado do serviço
export type ServiceHistoryEntry = {
  previousStatus: ServiceStatus;
  newStatus: ServiceStatus;
  changedAt: string;
  changedByUserId: number;
  changedByName: string;
  changedByRole: "CLIENT" | "PROVIDER";
};

// Proposta dentro de uma solicitação direta
export type ServiceDirectRequestProposal = {
  proposalId: number;
  amount: number;
  conditions: string;
  obs: string | null;
  status: ProposalStatus;
  creationDate: string;
  decisionDate: string | null;
};

// Solicitação direta de um serviço
export type ServiceDirectRequest = {
  directRequestId: number;
  status: DirectRequestStatus;
  creationDate: string;
  responseDate: string | null;
  professionalProfile: ProfessionalProfileSummary;
  proposal: ServiceDirectRequestProposal | null;
};

// Proposta de um trabalho publicado
export type ServiceProposal = ServiceDirectRequestProposal & {
  professionalProfile: ProfessionalProfileSummary;
};

// Detalhe do serviço do Cliente (também é a resposta da criação do serviço)
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

// A observação é opcional e não é enviada quando está vazia
export type ProposalInput = { amount: number; conditions: string; obs?: string };

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

// O comentário é opcional e não é enviado quando está vazio
export type ReviewInput = { rating: number; comment?: string };

// ---------------------------------------------------------------------------
// Relatórios
// ---------------------------------------------------------------------------

export type CategoryCount = CategoryRef & { count: number };
export type StatusCount = { status: Exclude<ServiceStatus, "OPEN">; count: number };

export type CompletedServiceRow = {
  serviceId: number;
  actualCompletionDate: string;
  serviceCategory: CategoryRef;
  providerName: string;
  amount: number;
};

export type MonthlyRating = { month: string; reviewCount: number; averageRating: number | null };

export type ClientReport = {
  contractedServices: number;
  byCategory: CategoryCount[];
  byStatus: StatusCount[];
  totalAcceptedAmount: number;
  completedHistory: CompletedServiceRow[];
};

export type ProviderReport = {
  completedServices: number;
  byCategory: CategoryCount[];
  byStatus: StatusCount[];
  directRequestsReceived: number;
  proposals: { accepted: number; declined: number };
  totalAcceptedAmount: number;
  ratingEvolution: MonthlyRating[];
};

// ---------------------------------------------------------------------------
// Parâmetros de query das listas e das pesquisas
// ---------------------------------------------------------------------------

type Paging = { page?: number; pageSize?: number };

export type AccountsParams = Paging & { role?: "CLIENT" | "PROVIDER"; status?: ActivationStatus };
export type ReviewsParams = Paging;
export type SearchProvidersParams = Paging & {
  serviceCategoryId: number;
  address?: string;
  name?: string;
};
export type SearchServicesParams = Paging & {
  serviceCategoryId?: number;
  withinServiceRadius?: boolean;
};
export type ServicesParams = Paging & { status?: ServiceStatus };
export type DirectRequestsParams = Paging & { status?: DirectRequestStatus };
export type ProposalsParams = Paging & { status?: ProposalStatus };
export type ReportParams = { startDate?: string; endDate?: string }; // datas AAAA-MM-DD
