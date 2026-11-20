import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate } from "react-router";
import { Info } from "lucide-react";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { ProfileInput } from "@/api/types";
import { ProfileForm } from "@/components/profiles/ProfileForm";
import { Callout } from "@/components/ui/Callout";
import { PageHeader } from "@/components/ui/PageHeader";
import { toast } from "@/components/ui/Toast";
import { useMe } from "@/hooks/useMe";
import { getErrorMessage, isApiError } from "@/utils/errors";
import styles from "./CreateProfilePage.module.css";

export function CreateProfilePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: me } = useMe();

  const refreshMe = () => qc.invalidateQueries({ queryKey: queryKeys.me, refetchType: "all" });

  const create = useMutation({
    mutationFn: (body: ProfileInput) =>
      api<unknown>("/profiles", { method: "POST", body: JSON.stringify(body) }), // E12
    onSuccess: refreshMe,
    onError: (e) => {
      if (!isApiError(e) || (e.status !== 400 && e.status !== 401 && !e.errors)) {
        toast(getErrorMessage(e));
      }
      // Perfil já criado noutro separador: com o utilizador atualizado, esta página leva ao início
      if (isApiError(e) && e.status === 409 && !e.errors) {
        return refreshMe();
      }
    },
  });

  const handleProfileSubmit = async (body: ProfileInput) => {
    await create.mutateAsync(body);
    toast("Perfil criado.");
    navigate("/prestador");
  };

  // O perfil só se cria uma vez: quem já o tem vai para o início do Prestador
  if (me!.professionalProfileId) {
    return <Navigate to="/prestador" replace />;
  }

  return (
    <div className={styles.page}>
      <title>Criar perfil profissional · LocalHub</title>
      <PageHeader title="Criar perfil profissional" />
      <Callout icon={Info}>
        Para aceder às funcionalidades de Prestador (solicitações, pesquisa de trabalhos, propostas
        e relatório), crie primeiro o seu perfil profissional.
      </Callout>
      <ProfileForm onSubmit={handleProfileSubmit} submitLabel="Criar perfil" />
    </div>
  );
}
