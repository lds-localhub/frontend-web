import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { ServiceDetail } from "@/api/types";
import {
  acceptProposalText,
  cancelServiceText,
  completeServiceText,
  declineProposalText,
} from "@/components/services/serviceConfirmTexts";
import { BackLink } from "@/components/ui/BackLink";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loading } from "@/components/ui/Loading";
import { toast } from "@/components/ui/Toast";
import { useCancelService } from "@/hooks/useCancelService";
import { useMe } from "@/hooks/useMe";
import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { getErrorMessage, isApiError } from "@/utils/errors";
import { parseId } from "@/utils/parseId";
import { DirectRequestCard } from "./DirectRequestCard";
import { ProposalCard } from "./ProposalCard";
import { ReviewDialog } from "./ReviewDialog";
import { ServiceOverview } from "./ServiceOverview";
import styles from "./ServiceDetailPage.module.css";

// Prestador da proposta aceite, numa ou noutra modalidade (para o histórico e para as solicitações
// que ficaram sem efeito por causa dela)
function acceptedProviderOf(service: ServiceDetail): string | undefined {
  const request = service.directRequests.find((r) => r.proposal?.status === "ACCEPTED");
  const proposal = service.proposals.find((p) => p.status === "ACCEPTED");
  return (request ?? proposal)?.professionalProfile.name;
}

// Nome do Prestador de uma proposta, para o título da confirmação
function providerOfProposal(service: ServiceDetail, proposalId: number): string {
  const request = service.directRequests.find((r) => r.proposal?.proposalId === proposalId);
  const proposal = service.proposals.find((p) => p.proposalId === proposalId);
  return (request ?? proposal)?.professionalProfile.name ?? "";
}

// Decisão à espera de confirmação: aceitar ou recusar uma proposta, cancelar ou marcar como realizado
type Confirming =
  { action: "accept" | "decline"; proposalId: number } | { action: "cancel" | "complete" };

// Mensagem de qualquer erro da ação, exceto o 400 e os erros de campo (não há formulário) e o 401
function showActionError(e: unknown) {
  if (!isApiError(e) || (e.status !== 400 && e.status !== 401 && !e.errors)) {
    toast(getErrorMessage(e));
  }
}

// W15 (solicitações diretas) e W18 (aberto a propostas): um só componente; o proposalModel escolhe a
// secção de baixo. As decisões do Cliente pedem confirmação (W41); a avaliação abre uma janela (W19).
export function ServiceDetailPage() {
  const id = parseId(useParams().serviceId);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: me } = useMe();
  // O E22 só é usado aqui, por isso a query fica no componente, sem hook (7.1)
  const service = useQuery({
    queryKey: queryKeys.services.detail(id!),
    queryFn: () => api<ServiceDetail>(`/services/${id}`),
    enabled: id !== null,
  });

  const [confirming, setConfirming] = useState<Confirming | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  // O estado do serviço e das propostas; atribuído ou realizado, muda também os relatórios (8.3)
  const refreshServices = () =>
    qc.invalidateQueries({ queryKey: queryKeys.services.all, refetchType: "all" });
  const refreshServicesAndReports = () =>
    Promise.all([
      refreshServices(),
      qc.invalidateQueries({ queryKey: queryKeys.reports.all, refetchType: "all" }),
    ]);
  // Estado diferente no servidor (ex.: o Prestador cancelou entretanto): atualiza o ecrã
  const onActionError = (refresh: () => Promise<unknown>) => (e: unknown) => {
    showActionError(e);
    if (isApiError(e) && e.status === 409 && !e.errors) {
      return refresh();
    }
  };

  const accept = useMutation({
    mutationFn: (proposalId: number) =>
      api<unknown>(`/proposals/${proposalId}/accept`, { method: "POST" }), // E28
    onSuccess: refreshServicesAndReports,
    onError: onActionError(refreshServicesAndReports),
  });
  const decline = useMutation({
    mutationFn: (proposalId: number) =>
      api<unknown>(`/proposals/${proposalId}/decline`, { method: "POST" }), // E29
    onSuccess: refreshServices,
    onError: onActionError(refreshServices),
  });
  const complete = useMutation({
    mutationFn: () => api<unknown>(`/services/${id}/complete`, { method: "POST" }), // E31
    onSuccess: refreshServicesAndReports,
    onError: onActionError(refreshServicesAndReports),
  });
  const cancel = useCancelService(); // E30
  const pending = accept.isPending || decline.isPending || complete.isPending || cancel.isPending;

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

  // Só com o serviço aberto se aceitam ou recusam propostas
  const decision =
    s.status === "OPEN"
      ? {
          onAccept: (proposalId: number) => setConfirming({ action: "accept", proposalId }),
          onDecline: (proposalId: number) => setConfirming({ action: "decline", proposalId }),
          disabled: pending,
        }
      : undefined;

  // Título, texto, botão e ação da confirmação aberta (textos das confirmações, 12.6). A janela fecha
  // quando a ação termina, com sucesso ou com erro.
  const close = { onSettled: () => setConfirming(null) };
  const confirmationOf = (c: Confirming) => {
    switch (c.action) {
      case "accept":
        return {
          title: `Aceitar a proposta de ${providerOfProposal(s, c.proposalId)}?`,
          text: acceptProposalText(s.proposalModel),
          confirmLabel: "Confirmar",
          danger: false,
          run: () =>
            accept.mutate(c.proposalId, { ...close, onSuccess: () => toast("Proposta aceite.") }),
        };
      case "decline":
        return {
          title: `Recusar a proposta de ${providerOfProposal(s, c.proposalId)}?`,
          text: declineProposalText,
          confirmLabel: "Recusar",
          danger: true,
          run: () =>
            decline.mutate(c.proposalId, {
              ...close,
              onSuccess: () => toast("Proposta recusada."),
            }),
        };
      case "complete":
        return {
          title: `Marcar o serviço «${s.title}» como realizado?`,
          text: completeServiceText,
          confirmLabel: "Marcar como realizado",
          danger: false,
          run: () =>
            complete.mutate(undefined, {
              ...close,
              onSuccess: () => toast("Serviço marcado como realizado."),
            }),
        };
      case "cancel":
        return {
          title: `Cancelar o serviço «${s.title}»?`,
          text: cancelServiceText(s.status),
          confirmLabel: "Cancelar serviço",
          danger: true,
          run: () =>
            cancel.mutate(s.serviceId, { ...close, onSuccess: () => toast("Serviço cancelado.") }),
        };
    }
  };
  const dialog = confirming && confirmationOf(confirming);

  return (
    <div className={styles.page}>
      <title>{`${s.title} · LocalHub`}</title>
      <BackLink onClick={() => navigate("/servicos")}>Os meus serviços</BackLink>
      <ServiceOverview
        service={s}
        currentUserId={me?.userId}
        acceptedProviderName={acceptedProviderName}
        onCancel={() => setConfirming({ action: "cancel" })}
        onComplete={() => setConfirming({ action: "complete" })}
        onReview={() => setReviewOpen(true)}
        disabled={pending}
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
              decision={decision}
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
                decision={decision}
              />
            ))
          )}
        </section>
      )}

      <ConfirmDialog
        open={dialog !== null}
        title={dialog?.title ?? ""}
        confirmLabel={dialog?.confirmLabel ?? ""}
        onConfirm={() => dialog?.run()}
        onClose={() => setConfirming(null)}
        pending={pending}
        danger={dialog?.danger}
      >
        <p>{dialog?.text}</p>
      </ConfirmDialog>

      {reviewOpen && acceptedProviderName && (
        <ReviewDialog
          serviceId={s.serviceId}
          providerName={acceptedProviderName}
          onClose={() => setReviewOpen(false)}
        />
      )}
    </div>
  );
}
