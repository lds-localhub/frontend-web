import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api, toQueryString } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { Page, SearchServiceItem, SearchServicesParams } from "@/api/types";

// Pesquisa de serviços abertos a propostas: o número dos que estão no raio, no início do Prestador,
// e a pesquisa com filtros
export const useSearchServices = (params: SearchServicesParams) =>
  useQuery({
    queryKey: queryKeys.searchServices.list(params),
    queryFn: () => api<Page<SearchServiceItem>>(`/search/services?${toQueryString(params)}`),
    // Ao mudar de página ou de filtro, a lista anterior fica visível em vez do loading
    placeholderData: keepPreviousData,
  });
