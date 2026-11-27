import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { Profile, ProfileInput } from "@/api/types";
import { ProfileForm } from "@/components/profiles/ProfileForm";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loading } from "@/components/ui/Loading";
import { PageHeader } from "@/components/ui/PageHeader";
import { toast } from "@/components/ui/Toast";
import { useCategories } from "@/hooks/useCategories";
import { useMe } from "@/hooks/useMe";
import { useProfile } from "@/hooks/useProfile";
import { getErrorMessage, isApiError } from "@/utils/errors";
import styles from "./EditProfilePage.module.css";

// Só as categorias do perfil que ainda estão ativas: uma desativada entretanto já não aparece nas
// etiquetas, por isso sai do perfil ao guardar
const toFormValues = (profile: Profile, activeIds: Set<number>) => ({
  introduction: profile.introduction,
  contactDetails: profile.contactDetails,
  experience: profile.experience,
  serviceCategoryIds: profile.serviceCategories
    .map((c) => c.serviceCategoryId)
    .filter((id) => activeIds.has(id)),
  address: profile.address,
  serviceRadiusKm: profile.serviceRadiusKm,
});

export function EditProfilePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: me } = useMe();
  const profile = useProfile(me!.professionalProfileId!);
  const categories = useCategories();

  // A distância e o «dentro do raio» dos serviços, solicitações e propostas são calculados a partir
  // da morada e do raio do perfil
  const edit = useMutation({
    mutationFn: (body: ProfileInput) =>
      api<unknown>("/profiles/me", { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.profiles.all, refetchType: "all" }),
        qc.invalidateQueries({ queryKey: queryKeys.searchServices.all, refetchType: "all" }),
        qc.invalidateQueries({ queryKey: queryKeys.directRequests.all, refetchType: "all" }),
        qc.invalidateQueries({ queryKey: queryKeys.proposals.all, refetchType: "all" }),
      ]),
    onError: (e) => {
      if (!isApiError(e) || (e.status !== 400 && e.status !== 401 && !e.errors)) {
        toast(getErrorMessage(e));
      }
    },
  });

  const handleProfileSubmit = async (body: ProfileInput) => {
    await edit.mutateAsync(body);
    toast("Perfil atualizado.");
    navigate("/perfil");
  };

  const handleCancelClick = () => navigate("/perfil");

  if (profile.isError) {
    return (
      <ErrorState
        error={profile.error}
        onRetry={() => profile.refetch()}
        retrying={profile.isFetching}
      />
    );
  }

  if (categories.isError) {
    return (
      <ErrorState
        error={categories.error}
        onRetry={() => categories.refetch()}
        retrying={categories.isFetching}
      />
    );
  }

  // Os valores iniciais só são lidos uma vez: o formulário espera pelo perfil pedido agora, e não usa o
  // da cache, que pode ter sido alterado noutro separador ou dispositivo
  if (profile.isPending || !profile.isFetchedAfterMount || categories.isPending) {
    return <Loading />;
  }

  const activeIds = new Set(categories.data.items.map((c) => c.serviceCategoryId));

  return (
    <div className={styles.page}>
      <title>Editar perfil profissional · LocalHub</title>
      <PageHeader title="Editar perfil profissional" />
      <ProfileForm
        defaultValues={toFormValues(profile.data, activeIds)}
        onSubmit={handleProfileSubmit}
        onCancel={handleCancelClick}
        submitLabel="Guardar"
      />
    </div>
  );
}
