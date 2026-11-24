import { useLocation, useNavigate, useParams } from "react-router";
import { ProviderProfile } from "@/components/profiles/ProviderProfile";
import { BackLink } from "@/components/ui/BackLink";
import { useProfile } from "@/hooks/useProfile";
import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { parseId } from "@/utils/parseId";

// A distância e a categoria vêm do resultado da pesquisa (estado da navegação); o E13 não as tem
function readSearchState(state: unknown): { distanceKm?: number; serviceCategoryId?: number } {
  if (typeof state !== "object" || state === null) {
    return {};
  }
  return {
    distanceKm:
      "distanceKm" in state && typeof state.distanceKm === "number" ? state.distanceKm : undefined,
    serviceCategoryId:
      "serviceCategoryId" in state && typeof state.serviceCategoryId === "number"
        ? state.serviceCategoryId
        : undefined,
  };
}

// W12: perfil de um Prestador, visto pelo Cliente a partir da pesquisa (RF-F004-03)
export function ProviderProfilePage() {
  const id = parseId(useParams().professionalProfileId);
  const location = useLocation();
  const navigate = useNavigate();
  // Só para o título do separador: a mesma cache do ProviderProfile, sem pedido extra
  const { data: profile } = useProfile(id ?? undefined);

  // Sem página anterior na aplicação (link aberto diretamente), «voltar» sairia do LocalHub
  const handleBackClick = () =>
    location.key === "default" ? navigate("/pesquisa/prestadores") : navigate(-1);

  if (id === null) {
    return <NotFoundPage />; // ID inválido no URL (8.1)
  }
  return (
    <>
      <title>{`${profile?.name ?? "Perfil do Prestador"} · LocalHub`}</title>
      <BackLink onClick={handleBackClick}>Voltar aos resultados</BackLink>
      <ProviderProfile id={id} isOwn={false} {...readSearchState(location.state)} />
    </>
  );
}
