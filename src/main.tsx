import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { queryClient } from "@/api/queryClient";
import { ToastProvider } from "@/components/ui/Toast";
import { router } from "@/routes/router";
// Tipos de letra servidos pelo próprio site, sem pedidos ao Google Fonts (RGPD).
// A Bricolage Grotesque é variável com o eixo opsz, para ajustar o desenho ao tamanho dos títulos.
import "@fontsource/figtree/400.css";
import "@fontsource/figtree/500.css";
import "@fontsource/figtree/600.css";
import "@fontsource/figtree/700.css";
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@/styles/tokens.css";
import "@/styles/base.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);
