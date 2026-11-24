import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { ServiceDetail } from "@/api/types";
import { BackLink } from "@/components/ui/BackLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loading } from "@/components/ui/Loading";
import { useMe } from "@/hooks/useMe";
import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { isApiError } from "@/utils/errors";
import { parseId } from "@/utils/parseId";
import { DirectRequestCard } from "./DirectRequestCard";
import { ProposalCard } from "./ProposalCard";
import { ServiceOverview } from "./ServiceOverview";
import styles from "./ServiceDetailPage.module.css";

// Prestador da proposta aceite, numa ou noutra modalidade (para o histórico e para as solicitações
// que ficaram sem efeito por causa dela)
function acceptedProviderOf(service: ServiceDetail): string | undefined {
  const request = service.directRequests.find((r) => r.proposal?.status === "ACCEPTED");
  const proposal = service.proposals.find((p) => p.status === "ACCEPTED");
  return (request ?? proposal)?.professionalProfile.name;
}

// W15 (solicitações diretas) e W18 (aberto a propostas): um só componente; o proposalModel escolhe a
// secção de baixo. Na tarefa B é só de consulta; as ações (E28 a E32) ficam para a tarefa C.
export function ServiceDetailPage() {
  const id = parseId(useParams().serviceId);
  const navigate = useNavigate();
  const { data: me } = useMe();
  // O E22 só é usado aqui, por isso a query fica no componente, sem hook (7.1)
  const service = useQuery({
    queryKey: queryKeys.services.detail(id!),
    queryFn: () => api<ServiceDetail>(`/services/${id}`),
    enabled: id !== null,
  });

  if (id === null) {
    return <NotFoundPage />; // ID inválido no URL (8.1)
  }
  if (service.isPending) {
    return <Loading />;
  }
  if (service.isError) {
    // Um serviço que não existe ou que não é do Cliente: tentar outra vez não resolve
    if (
      isApiError(service.error) &&
      (service.error.status === 404 || service.error.status === 403)
    ) {
      return (
        <NotFoundPage
          title="Serviço não encontrado"
          text="O serviço que procura não existe ou não é um dos seus serviços."
          action={{ to: "/servicos", label: "Os meus serviços" }}
        />
      );
    }
    return (
      <ErrorState error={service.error} onRetry={service.refetch} retrying={service.isFetching} />
    );
  }

  const s = service.data;
  const acceptedProviderName = acceptedProviderOf(s);
  // As propostas só ficam sem efeito por causa do cancelamento se o serviço foi cancelado ainda aberto;
  // cancelado depois de atribuído, as outras já tinham ficado sem efeito quando aceitou uma. Não
  // trazem data (decisionDate a null): a data é a do cancelamento, a última alteração do histórico.
  const last = s.history.at(-1);
  const voidedByCancellationAt =
    last?.newStatus === "CANCELLED" && last.previousStatus === "OPEN" ? last.changedAt : undefined;

  return (
    <div className={styles.page}>
      <title>{`${s.title} · LocalHub`}</title>
      <BackLink onClick={() => navigate("/servicos")}>Os meus serviços</BackLink>
      <ServiceOverview
        service={s}
        currentUserId={me?.userId}
        acceptedProviderName={acceptedProviderName}
      />

      {s.proposalModel === "DIRECT_REQUEST" ? (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Solicitações ({s.directRequests.length})</h2>
          {s.directRequests.map((r) => (
            <DirectRequestCard
              key={r.directRequestId}
              request={r}
              acceptedProviderName={acceptedProviderName}
              voidedByCancellationAt={voidedByCancellationAt}
            />
          ))}
        </section>
      ) : (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Propostas ({s.proposals.length})</h2>
          {s.proposals.length === 0 ? (
            <EmptyState>Ainda não recebeu propostas.</EmptyState>
          ) : (
            s.proposals.map((p) => (
              <ProposalCard
                key={p.proposalId}
                proposal={p}
                voidedByCancellationAt={voidedByCancellationAt}
              />
            ))
          )}
        </section>
      )}
    </div>
  );
}
