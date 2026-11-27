import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api, toQueryString } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { Page, ProviderSearchItem, SearchProvidersParams } from "@/api/types";

// Pesquisa de Prestadores, usada na página da pesquisa e no painel de seleção do criar serviço.
// Com params a null (sem categoria, ou sem localização de referência), fica desligada: sem pedido.
export const useSearchProviders = (params: SearchProvidersParams | null) =>
  useQuery({
    queryKey: queryKeys.searchProviders.list(params!),
    queryFn: () => api<Page<ProviderSearchItem>>(`/search/providers?${toQueryString(params!)}`),
    enabled: params !== null,
    placeholderData: keepPreviousData, // ao mudar de página ou de filtro, mantém a lista anterior
  });
