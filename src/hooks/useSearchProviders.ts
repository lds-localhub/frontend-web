import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api, toQueryString } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { Page, ProviderSearchItem, SearchProvidersParams } from "@/api/types";

// Pesquisa de Prestadores (E18), usada no W01/W11 e no painel de seleção do W13/W16.
// Com params a null (sem categoria, ou sem localização de referência), fica desligada: sem pedido.
export const useSearchProviders = (params: SearchProvidersParams | null) =>
  useQuery({
    queryKey: queryKeys.searchProviders.list(params!),
    queryFn: () => api<Page<ProviderSearchItem>>(`/search/providers?${toQueryString(params!)}`),
    enabled: params !== null,
    placeholderData: keepPreviousData, // ao mudar de página ou de filtro, mantém a lista anterior (8.4)
  });
