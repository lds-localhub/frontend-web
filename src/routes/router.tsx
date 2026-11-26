import { createBrowserRouter, createRoutesFromElements, Route } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { ChangePasswordPage } from "@/pages/account/ChangePasswordPage/ChangePasswordPage";
import { AccountsPage } from "@/pages/admin/AccountsPage/AccountsPage";
import { AdminHomePage } from "@/pages/admin/AdminHomePage";
import { CategoriesPage } from "@/pages/admin/CategoriesPage/CategoriesPage";
import { ClientHomePage } from "@/pages/client/ClientHomePage";
import { ClientReportPage } from "@/pages/client/ClientReportPage";
import { CreateServicePage } from "@/pages/client/CreateServicePage/CreateServicePage";
import { MyLocationPage } from "@/pages/client/MyLocationPage";
import { ProviderProfilePage } from "@/pages/client/ProviderProfilePage";
import { ServiceDetailPage } from "@/pages/client/ServiceDetailPage/ServiceDetailPage";
import { CreateProfilePage } from "@/pages/provider/CreateProfilePage";
import { DirectRequestDetailPage } from "@/pages/provider/DirectRequestDetailPage/DirectRequestDetailPage";
import { DirectRequestsPage } from "@/pages/provider/DirectRequestsPage";
import { EditProfilePage } from "@/pages/provider/EditProfilePage";
import { MyProfilePage } from "@/pages/provider/MyProfilePage";
import { PendingPage } from "@/pages/provider/PendingPage";
import { ProviderHomePage } from "@/pages/provider/ProviderHomePage";
import { ProviderReportPage } from "@/pages/provider/ProviderReportPage/ProviderReportPage";
import { LoginPage } from "@/pages/public/LoginPage";
import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { ProviderSearchPage } from "@/pages/public/ProviderSearchPage/ProviderSearchPage";
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
            <Route path="/servicos/novo" element={<CreateServicePage />} />
            <Route path="/servicos/:serviceId" element={<ServiceDetailPage />} />
            <Route path="/cliente/relatorio" element={<ClientReportPage />} />
            <Route path="/conta/localizacao" element={<MyLocationPage />} />
            <Route path="/prestadores/:professionalProfileId" element={<ProviderProfilePage />} />
          </Route>

          <Route element={<RequireRole roles={["PROVIDER"]} />}>
            <Route path="/prestador" element={<ProviderHomePage />} />
            <Route path="/solicitacoes" element={<DirectRequestsPage />} />
            <Route path="/solicitacoes/:directRequestId" element={<DirectRequestDetailPage />} />
            {/* Provisórias, até os ecrãs dos serviços e das propostas do Prestador serem implementados */}
            <Route path="/pesquisa/servicos" element={<PendingPage title="Pesquisar serviços" />} />
            <Route
              path="/pesquisa/servicos/:serviceId"
              element={<PendingPage title="Detalhe do serviço" />}
            />
            <Route path="/propostas" element={<PendingPage title="As minhas propostas" />} />
            <Route
              path="/propostas/:proposalId"
              element={<PendingPage title="Detalhe da proposta" />}
            />
            <Route path="/prestador/relatorio" element={<ProviderReportPage />} />
            <Route path="/perfil" element={<MyProfilePage />} />
            <Route path="/perfil/editar" element={<EditProfilePage />} />
          </Route>

          <Route element={<RequireRole roles={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminHomePage />} />
            <Route path="/admin/contas" element={<AccountsPage />} />
            <Route path="/admin/categorias" element={<CategoriesPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Route>,
  ),
);
