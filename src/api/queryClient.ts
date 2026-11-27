import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./client";

// Mantêm-se os valores por omissão (staleTime: 0, gcTime: 5 min, refetchOnWindowFocus e refetchOnMount).
// As mutações ficam com retry: 0 (valor por omissão): um pedido de alteração nunca é repetido
// automaticamente, nem depois de uma falha de rede, para não ser feito duas vezes.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Sem ligação, o pedido é feito e falha com a mensagem de rede, em vez de ficar em pausa até a ligação voltar
      networkMode: "always",
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status < 500) return false; // 4xx: sem novas tentativas
        return failureCount < 2; // rede ou 5xx: até 2
      },
    },
    mutations: {
      // Sem ligação, a ação falha logo com a mensagem de rede, em vez de o botão ficar à espera
      networkMode: "always",
    },
  },
});
