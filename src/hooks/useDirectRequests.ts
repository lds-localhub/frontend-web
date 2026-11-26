import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api, toQueryString } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { DirectRequestItem, DirectRequestsParams, Page } from "@/api/types";

// Solicitações diretas recebidas pelo Prestador: as pendentes no início e a lista completa, com filtro
export const useDirectRequests = (params: DirectRequestsParams) =>
  useQuery({
    queryKey: queryKeys.directRequests.list(params),
    queryFn: () => api<Page<DirectRequestItem>>(`/direct-requests?${toQueryString(params)}`),
    // Ao mudar de página ou de filtro, a lista anterior fica visível em vez do loading
    placeholderData: keepPreviousData,
  });
