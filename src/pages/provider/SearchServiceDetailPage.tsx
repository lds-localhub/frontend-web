import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { ProposalInput, SearchServiceDetail } from "@/api/types";
import { ProposalForm } from "@/components/proposals/ProposalForm";
import { SentProposalCard } from "@/components/proposals/SentProposalCard";
import { ServiceInfoCard } from "@/components/services/ServiceInfoCard";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loading } from "@/components/ui/Loading";
import { toast } from "@/components/ui/Toast";
import { useMe } from "@/hooks/useMe";
import { useProfile } from "@/hooks/useProfile";
import { useProposal } from "@/hooks/useProposal";
import { useSubmitProposal } from "@/hooks/useSubmitProposal";
import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { isApiError } from "@/utils/errors";
import { parseId } from "@/utils/parseId";
import styles from "./ServiceAndProposal.module.css";

// Serviço aberto a propostas encontrado na pesquisa, com o envio da proposta; depois de enviada, a
// proposta aparece no lugar do formulário
export function SearchServiceDetailPage() {
  const id = parseId(useParams().serviceId);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: me } = useMe();

  const service = useQuery({
    queryKey: queryKeys.searchServices.detail(id!),
    queryFn: () => api<SearchServiceDetail>(`/search/services/${id}`),
    enabled: id !== null, // ID inválido: sem pedido
  });
  // Só o perfil diz as categorias do Prestador, e a proposta só é aceite na categoria do perfil
  const profile = useProfile(me!.professionalProfileId!);
  const proposal = useProposal(service.data?.myProposalId ?? null);
  const submit = useSubmitProposal();

  // Aberto diretamente, sem página anterior na aplicação, volta à pesquisa
  const handleBackClick = () => {
    if (location.key === "default") {
      navigate("/pesquisa/servicos");
    } else {
      navigate(-1);
    }
  };

  // O ID é verificado antes do loading: com um ID inválido a query fica desligada e nunca sairia dele
  if (id === null) {
    return <NotFoundPage />;
  }
  // Serviço que não existe ou que já não está aberto (atribuído, cancelado ou de um Cliente
  // desativado): tentar outra vez não resolve, por isso não é o ErrorState
  if (isApiError(service.error) && service.error.status === 404) {
    return (
      <NotFoundPage
        title="Serviço indisponível"
        text="Este serviço já não está aberto a propostas."
        action={{ to: "/pesquisa/servicos", label: "Voltar aos serviços" }}
      />
    );
  }
  if (service.isPending) {
    return <Loading />;
  }
  if (service.isError) {
    return (
      <ErrorState error={service.error} onRetry={service.refetch} retrying={service.isFetching} />
    );
  }

  const { data } = service;
  const hasCategory = profile.data?.serviceCategories.some(
    (c) => c.serviceCategoryId === data.serviceCategory.serviceCategoryId,
  );

  // Depois do envio, o formulário fica desativado até o serviço voltar a ser lido com a proposta
  const handleProposalSubmit = async (body: ProposalInput) => {
    await submit.mutateAsync({ serviceId: data.serviceId, body });
    toast("Proposta enviada.");
  };

  let side: ReactNode;
  if (data.myProposalId !== null) {
    if (proposal.isPending) {
      side = <Loading />;
    } else if (proposal.isError) {
      side = (
        <ErrorState
          error={proposal.error}
          onRetry={proposal.refetch}
          retrying={proposal.isFetching}
        />
      );
    } else {
      side = <SentProposalCard proposal={proposal.data} />;
    }
  } else if (profile.isError) {
    // Sem o perfil não se sabe se a categoria é do Prestador: o formulário ficava sempre desativado
    side = (
      <ErrorState error={profile.error} onRetry={profile.refetch} retrying={profile.isFetching} />
    );
  } else if (profile.data && !hasCategory) {
    // Sem a categoria no perfil, a proposta seria recusada: o formulário não chega a ser preenchido
    side = (
      <Card>
        <div className={styles.blocked}>
          <h2 className={styles.blockedTitle}>Apresentar proposta</h2>
          <p>Este trabalho é de uma categoria que não está no seu perfil.</p>
          <Button disabled>Enviar proposta</Button>
        </div>
      </Card>
    );
  } else {
    side = (
      <ProposalForm
        disabled={!profile.data || service.isFetching || submit.isPending}
        onSubmit={handleProposalSubmit}
      />
    );
  }

  return (
    <div className={styles.page}>
      <title>Detalhe do serviço · LocalHub</title>
      <BackLink onClick={handleBackClick}>Voltar aos serviços</BackLink>
      <div className={styles.columns}>
        <ServiceInfoCard service={data} />
        <div className={styles.side}>{side}</div>
      </div>
    </div>
  );
}
