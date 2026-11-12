import { useQuery } from "@tanstack/react-query";
import { api, getToken } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { Me } from "@/api/types";

// Utilizador autenticado (E04), partilhado por todos os componentes através da cache.
export const useMe = () =>
  useQuery({
    queryKey: queryKeys.me,
    queryFn: () => api<Me>("/auth/me"),
    staleTime: Infinity, // só é pedido outra vez quando for invalidado (E12, E16)
    retry: false,
    enabled: !!getToken(), // sem token (Visitante), a query não corre
  });
