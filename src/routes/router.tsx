import { createBrowserRouter, createRoutesFromElements, Route } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { ChangePasswordPage } from "@/pages/account/ChangePasswordPage";
import { AdminHomePage } from "@/pages/admin/AdminHomePage";
import { CategoriesPage } from "@/pages/admin/CategoriesPage/CategoriesPage";
import { ClientHomePage } from "@/pages/client/ClientHomePage";
import { CreateProfilePage } from "@/pages/provider/CreateProfilePage";
import { ProviderHomePage } from "@/pages/provider/ProviderHomePage";
import { LoginPage } from "@/pages/public/LoginPage";
import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { ProviderSearchPage } from "@/pages/public/ProviderSearchPage";
import { RegisterPage } from "@/pages/public/RegisterPage";
import { UnexpectedErrorPage } from "@/pages/public/UnexpectedErrorPage";
import { RequireAuth, RequireProfile, RequireRole } from "./guards";
import { RootRedirect } from "./RootRedirect";

// Árvore de rotas: públicas; com sessão (RequireAuth); com perfil profissional (RequireProfile);
// por papel (RequireRole); e rota inexistente
export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppLayout />} errorElement={<UnexpectedErrorPage />}>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registar" element={<RegisterPage />} />
      <Route path="/pesquisa/prestadores" element={<ProviderSearchPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/conta/palavra-passe" element={<ChangePasswordPage />} />

        <Route element={<RequireRole roles={["PROVIDER"]} />}>
          <Route path="/perfil/criar" element={<CreateProfilePage />} />
        </Route>

        <Route element={<RequireProfile />}>
          <Route element={<RequireRole roles={["CLIENT"]} />}>
            <Route path="/cliente" element={<ClientHomePage />} />
          </Route>

          <Route element={<RequireRole roles={["PROVIDER"]} />}>
            <Route path="/prestador" element={<ProviderHomePage />} />
          </Route>

          <Route element={<RequireRole roles={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminHomePage />} />
            <Route path="/admin/categorias" element={<CategoriesPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Route>,
  ),
);
