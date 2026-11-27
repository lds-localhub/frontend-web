import type {
  AccountsParams,
  DirectRequestsParams,
  ProposalsParams,
  ReportParams,
  ReviewsParams,
  SearchProvidersParams,
  SearchServicesParams,
  ServicesParams,
} from "./types";

// Todas as chaves das queries. Convenção: recurso, 'list' ou 'detail', parâmetros.
// Invalidar queryKeys.<recurso>.all apanha as listas e os detalhes desse recurso.
export const queryKeys = {
  me: ["auth", "me"] as const,

  categories: {
    all: ["categories"] as const,
    active: ["categories", "active"] as const,
    // Também as desativadas, para a gestão de categorias
    withInactive: ["categories", "with-inactive"] as const,
  },

  services: {
    all: ["services"] as const,
    list: (params: ServicesParams) => ["services", "list", params] as const,
    detail: (id: number) => ["services", "detail", id] as const,
  },

  directRequests: {
    all: ["direct-requests"] as const,
    list: (params: DirectRequestsParams) => ["direct-requests", "list", params] as const,
    detail: (id: number) => ["direct-requests", "detail", id] as const,
  },

  proposals: {
    all: ["proposals"] as const,
    list: (params: ProposalsParams) => ["proposals", "list", params] as const,
    detail: (id: number) => ["proposals", "detail", id] as const,
  },

  searchProviders: {
    all: ["search-providers"] as const,
    list: (params: SearchProvidersParams) => ["search-providers", "list", params] as const,
  },

  searchServices: {
    all: ["search-services"] as const,
    list: (params: SearchServicesParams) => ["search-services", "list", params] as const,
    detail: (id: number) => ["search-services", "detail", id] as const,
  },

  profiles: {
    all: ["profiles"] as const,
    detail: (id: number) => ["profiles", "detail", id] as const,
    reviews: (id: number, params: ReviewsParams) => ["profiles", "reviews", id, params] as const,
  },

  accounts: {
    all: ["accounts"] as const,
    list: (params: AccountsParams) => ["accounts", "list", params] as const,
  },

  admin: {
    all: ["admin"] as const,
    summary: ["admin", "summary"] as const,
  },

  reports: {
    all: ["reports"] as const,
    client: (params: ReportParams) => ["reports", "client", params] as const,
    provider: (params: ReportParams) => ["reports", "provider", params] as const,
  },
};
