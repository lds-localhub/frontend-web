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
  me: ["auth", "me"] as const, // E04

  categories: {
    all: ["categories"] as const,
    active: ["categories", "active"] as const, // E08
    withInactive: ["categories", "with-inactive"] as const, // E08 com includeInactive=true (W52)
  },

  services: {
    all: ["services"] as const,
    list: (params: ServicesParams) => ["services", "list", params] as const, // E21
    detail: (id: number) => ["services", "detail", id] as const, // E22
  },

  directRequests: {
    all: ["direct-requests"] as const,
    list: (params: DirectRequestsParams) => ["direct-requests", "list", params] as const, // E23
    detail: (id: number) => ["direct-requests", "detail", id] as const, // E36
  },

  proposals: {
    all: ["proposals"] as const,
    list: (params: ProposalsParams) => ["proposals", "list", params] as const, // E27
    detail: (id: number) => ["proposals", "detail", id] as const, // E37
  },

  searchProviders: {
    all: ["search-providers"] as const,
    list: (params: SearchProvidersParams) => ["search-providers", "list", params] as const, // E18
  },

  searchServices: {
    all: ["search-services"] as const,
    list: (params: SearchServicesParams) => ["search-services", "list", params] as const, // E19
    detail: (id: number) => ["search-services", "detail", id] as const, // E38
  },

  profiles: {
    all: ["profiles"] as const,
    detail: (id: number) => ["profiles", "detail", id] as const, // E13
    reviews: (id: number, params: ReviewsParams) => ["profiles", "reviews", id, params] as const, // E15
  },

  accounts: {
    all: ["accounts"] as const,
    list: (params: AccountsParams) => ["accounts", "list", params] as const, // E05
  },

  admin: {
    all: ["admin"] as const,
    summary: ["admin", "summary"] as const, // E39
  },

  reports: {
    all: ["reports"] as const,
    client: (params: ReportParams) => ["reports", "client", params] as const, // E33
    provider: (params: ReportParams) => ["reports", "provider", params] as const, // E34
  },
};
