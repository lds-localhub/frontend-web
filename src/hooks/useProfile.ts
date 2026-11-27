import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { Profile } from "@/api/types";

// Perfil profissional de um Prestador, partilhado pela cache entre o perfil e o formulário de
// edição. Sem ID, não faz o pedido.
export const useProfile = (id: number | undefined) =>
  useQuery({
    queryKey: queryKeys.profiles.detail(id!),
    queryFn: () => api<Profile>(`/profiles/${id}`),
    enabled: !!id,
  });
