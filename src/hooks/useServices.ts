import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api, toQueryString } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { Page, ServiceItem, ServicesParams } from "@/api/types";

// Serviços do Cliente: os mais recentes no início e a lista completa, com filtro por estado
export const useServices = (params: ServicesParams) =>
  useQuery({
    queryKey: queryKeys.services.list(params),
    queryFn: () => api<Page<ServiceItem>>(`/services?${toQueryString(params)}`),
    // Ao mudar de página ou de filtro, a lista anterior fica visível em vez do loading
    placeholderData: keepPreviousData,
  });
