import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./client";

// Mantêm-se os valores por omissão (staleTime: 0, gcTime: 5 min, refetchOnWindowFocus e refetchOnMount).
// As mutações ficam com retry: 0 (valor por omissão): um pedido de alteração nunca é repetido
// automaticamente, nem depois de uma falha de rede (RNF-23).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status < 500) return false; // 4xx: sem novas tentativas
        return failureCount < 2; // rede ou 5xx: até 2
      },
    },
  },
});
