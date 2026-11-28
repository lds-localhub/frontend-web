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

// Criar serviço, nas duas modalidades. Quando é aberto a partir do perfil de um Prestador, o URL
// traz esse Prestador (?professionalProfileId) e a categoria da pesquisa (?serviceCategoryId).
export function CreateServicePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const categoryId = parseId(searchParams.get("serviceCategoryId"));
  const { data: me } = useMe();

  const providerId = parseId(searchParams.get("professionalProfileId"));
  // Prestador do URL mal escrito ou que não existe: o formulário abre sem ele e o painel dos
  // Prestadores explica porquê
  const preselected = useProfile(providerId ?? undefined);
  const malformedProviderId = !!searchParams.get("professionalProfileId") && providerId === null;
  const providerNotFound = isApiError(preselected.error) && preselected.error.status === 404;
  const invalidProviderId = malformedProviderId || providerNotFound;

  const create = useMutation({
    mutationFn: (body: ServiceInput) =>
      api<ServiceDetail>("/services", { method: "POST", body: JSON.stringify(body) }),
    // O serviço novo tem de aparecer nas listas dos serviços do Cliente
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.services.all, refetchType: "all" }),
    onError: (e) => {
      if (!isApiError(e) || (e.status !== 400 && e.status !== 401 && !e.errors)) {
        toast(getErrorMessage(e));
      }
    },
  });

  const handleServiceSubmit = async (body: ServiceInput) => {
    const service = await create.mutateAsync(body);
    // A resposta da criação já traz o serviço completo: guardá-la na cache faz o detalhe aparecer
    // logo, sem «A carregar…» (é pedido outra vez em segundo plano, para ficar atualizado)
    qc.setQueryData(queryKeys.services.detail(service.serviceId), service);
    toast("Serviço criado.");
    // O detalhe substitui o formulário no histórico: voltar atrás não regressa a um formulário já
    // enviado, que podia criar o serviço outra vez
    navigate(`/servicos/${service.serviceId}`, { replace: true });
  };

  // Sem página anterior na aplicação (formulário aberto diretamente), vai para os serviços
  const handleCancel = () => (location.key === "default" ? navigate("/servicos") : navigate(-1));

  // Só espera pelo perfil se houver um Prestador no URL: sem ele, a query está desligada e ficaria
  // à espera para sempre
  if (providerId && preselected.isPending) {
    return <Loading />;
  }

  if (providerId && preselected.isError && !providerNotFound) {
    return (
      <ErrorState
        error={preselected.error}
        onRetry={preselected.refetch}
        retrying={preselected.isFetching}
      />
    );
  }

  const provider = providerId ? preselected.data : undefined;
  const providerCategoryIds = provider?.serviceCategories.map((c) => c.serviceCategoryId) ?? [];

  return (
    <div className={styles.page}>
      <title>Criar serviço · LocalHub</title>
      <PageHeader title="Criar serviço" />
      <CreateServiceForm
        defaultValues={{
          // Com Prestador no URL, mesmo que não exista, o Cliente queria uma solicitação direta
          proposalModel: provider || invalidProviderId ? "DIRECT_REQUEST" : "PUBLIC",
          // A categoria da pesquisa só fica escolhida se o Prestador a tiver
          serviceCategoryId:
            categoryId && providerCategoryIds.includes(categoryId) ? categoryId : undefined,
          title: "",
          description: "",
          location: me?.address ?? "", // por omissão, a localização registada do Cliente
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
        preselectedProviderInvalid={invalidProviderId}
        onSubmit={handleServiceSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
