import { useQuery } from "@tanstack/react-query";
import { api, getToken } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { Me } from "@/api/types";

// Utilizador autenticado, partilhado por todos os componentes através da cache.
export const useMe = () =>
  useQuery({
    queryKey: queryKeys.me,
    queryFn: () => api<Me>("/auth/me"),
    // Só é pedido outra vez quando for invalidado (ex.: ao criar o perfil ou mudar a localização)
    staleTime: Infinity,
    retry: false,
    enabled: !!getToken(), // sem token (Visitante), a query não corre
  });
