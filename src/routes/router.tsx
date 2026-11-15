import { createBrowserRouter, createRoutesFromElements, Route } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { ChangePasswordPage } from "@/pages/account/ChangePasswordPage";
import { LoginPage } from "@/pages/public/LoginPage";
import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { ProviderSearchPage } from "@/pages/public/ProviderSearchPage";
import { RegisterPage } from "@/pages/public/RegisterPage";
import { UnexpectedErrorPage } from "@/pages/public/UnexpectedErrorPage";
import { RequireAuth } from "./guards";
import { RootRedirect } from "./RootRedirect";

// Árvore de rotas: públicas, com sessão (dentro do RequireAuth) e rota inexistente
export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppLayout />} errorElement={<UnexpectedErrorPage />}>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registar" element={<RegisterPage />} />
      <Route path="/pesquisa/prestadores" element={<ProviderSearchPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/conta/palavra-passe" element={<ChangePasswordPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Route>,
  ),
);
