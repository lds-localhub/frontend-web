import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { ServiceDetail, ServiceInput } from "@/api/types";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loading } from "@/components/ui/Loading";
import { PageHeader } from "@/components/ui/PageHeader";
import { toast } from "@/components/ui/Toast";
import { useMe } from "@/hooks/useMe";
import { useProfile } from "@/hooks/useProfile";
import { getErrorMessage, isApiError } from "@/utils/errors";
import { parseId } from "@/utils/parseId";
import { CreateServiceForm } from "./CreateServiceForm";
import styles from "./CreateServicePage.module.css";

// W13 (solicitação direta) e W16 (aberto a propostas): um só formulário. Aberto a partir do W12, traz
// o Prestador (?prestador) e a categoria da pesquisa (?categoria) (RF-F009-03, regras 4 e 5).
export function CreateServicePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const prestadorId = parseId(searchParams.get("prestador"));
  const categoriaId = parseId(searchParams.get("categoria"));
  const { data: me } = useMe();
  const preselected = useProfile(prestadorId ?? undefined);

  const create = useMutation({
    mutationFn: (body: ServiceInput) =>
      api<ServiceDetail>("/services", { method: "POST", body: JSON.stringify(body) }), // E20
    // O serviço novo nas listas do W10 e do W14 (8.3)
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.services.all, refetchType: "all" }),
    onError: (e) => {
      if (!isApiError(e) || (e.status !== 400 && e.status !== 401 && !e.errors)) {
        toast(getErrorMessage(e));
      }
    },
  });

  const handleServiceSubmit = async (body: ServiceInput) => {
    const service = await create.mutateAsync(body);
    toast("Serviço criado.");
    navigate(`/servicos/${service.serviceId}`);
  };

  // Sem página anterior na aplicação (formulário aberto diretamente), vai para os serviços
  const handleCancel = () => (location.key === "default" ? navigate("/servicos") : navigate(-1));

  // Só espera pelo perfil se houver Prestador pré-selecionado (8.4)
  if (prestadorId && preselected.isPending) {
    return <Loading />;
  }
  if (prestadorId && preselected.isError) {
    return (
      <ErrorState
        error={preselected.error}
        onRetry={preselected.refetch}
        retrying={preselected.isFetching}
      />
    );
  }

  const provider = prestadorId ? preselected.data : undefined;
  const providerCategoryIds = provider?.serviceCategories.map((c) => c.serviceCategoryId) ?? [];

  return (
    <div className={styles.page}>
      <title>Criar serviço · LocalHub</title>
      <PageHeader title="Criar serviço" />
      <CreateServiceForm
        defaultValues={{
          proposalModel: provider ? "DIRECT_REQUEST" : "PUBLIC",
          // A categoria da pesquisa só fica escolhida se for uma das do Prestador (RF-F009-03, regra 5)
          serviceCategoryId:
            categoriaId && providerCategoryIds.includes(categoriaId) ? categoriaId : undefined,
          title: "",
          description: "",
          location: me?.address ?? "", // RF-F009-01, regra 3
          dateMode: "single",
          requestedStartDate: "",
          requestedEndDate: "",
          providers: provider
            ? [
                {
                  professionalProfileId: provider.professionalProfileId,
                  name: provider.name,
                  serviceCategoryIds: providerCategoryIds,
                },
              ]
            : [],
        }}
        preselectedProviderId={provider?.professionalProfileId ?? null}
        onSubmit={handleServiceSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
