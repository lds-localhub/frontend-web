import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { DirectRequestDetail, ProposalInput } from "@/api/types";
import { ProposalForm } from "@/components/proposals/ProposalForm";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loading } from "@/components/ui/Loading";
import { toast } from "@/components/ui/Toast";
import { useSubmitProposal } from "@/hooks/useSubmitProposal";
import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { getErrorMessage, isApiError } from "@/utils/errors";
import { parseId } from "@/utils/parseId";
import { DirectRequestHeader } from "./DirectRequestHeader";
import styles from "./DirectRequestDetailPage.module.css";

// Detalhe de uma solicitação direta recebida: o serviço e o histórico e, enquanto estiver pendente,
// a proposta ou a recusa. Depois de respondida, leva à proposta apresentada.
export function DirectRequestDetailPage() {
  const id = parseId(useParams().directRequestId);
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();

  const request = useQuery({
    queryKey: queryKeys.directRequests.detail(id!),
    queryFn: () => api<DirectRequestDetail>(`/direct-requests/${id}`),
    enabled: id !== null, // ID inválido: sem pedido
  });

  const submit = useSubmitProposal();
  const [confirmingDecline, setConfirmingDecline] = useState(false);

  const refreshRequests = () =>
    qc.invalidateQueries({ queryKey: queryKeys.directRequests.all, refetchType: "all" });

  const decline = useMutation({
    mutationFn: () => api<unknown>(`/direct-requests/${id}/decline`, { method: "POST" }),
    onSuccess: refreshRequests,
    onError: (e) => {
      if (!isApiError(e) || (e.status !== 400 && e.status !== 401 && !e.errors)) {
        toast(getErrorMessage(e));
      }
      // Estado diferente no servidor (ex.: o serviço foi cancelado entretanto): atualiza o ecrã
      if (isApiError(e) && e.status === 409 && !e.errors) {
        return refreshRequests();
      }
    },
  });

  // Aberto diretamente, sem página anterior na aplicação, volta à lista das solicitações
  const handleBackClick = () => {
    if (location.key === "default") {
      navigate("/solicitacoes");
    } else {
      navigate(-1);
    }
  };

  // O ID é verificado antes do loading: com um ID inválido a query fica desligada e o loading
  // nunca terminaria
  if (id === null) {
    return <NotFoundPage />;
  }
  // Solicitação que não existe ou que não é deste Prestador: tentar outra vez não resolve
  if (isApiError(request.error) && request.error.status === 404) {
    return (
      <NotFoundPage
        title="Solicitação não encontrada"
        text="A solicitação que procura não existe."
        action={{ to: "/solicitacoes", label: "Voltar às solicitações" }}
      />
    );
  }
  if (request.isPending) {
    return <Loading />;
  }
  if (request.isError) {
    return (
      <ErrorState error={request.error} onRetry={request.refetch} retrying={request.isFetching} />
    );
  }

  const { data } = request;
  // A solicitação pode estar pendente com o serviço já atribuído a outro Prestador ou cancelado.
  // Aí o backend recusaria a proposta, por isso só se mostra o formulário com o serviço aberto.
  const canRespond = data.status === "PENDING" && data.service.status === "OPEN";
  const busy = request.isFetching || submit.isPending || decline.isPending;

  const handleProposalSubmit = async (body: ProposalInput) => {
    await submit.mutateAsync({ serviceId: data.service.serviceId, body });
    toast("Proposta enviada.");
  };

  // A recusa não pode ser anulada, por isso só é feita depois de confirmar; a janela fecha quando a
  // ação termina
  const handleConfirmDecline = () =>
    decline.mutate(undefined, {
      onSuccess: () => toast("Solicitação recusada."),
      onSettled: () => setConfirmingDecline(false),
    });

  return (
    <div className={styles.page}>
      <title>Detalhe da solicitação · LocalHub</title>
      <BackLink onClick={handleBackClick}>Solicitações recebidas</BackLink>
      <DirectRequestHeader data={data} />
      {canRespond ? (
        <ProposalForm
          disabled={busy}
          onSubmit={handleProposalSubmit}
          onDecline={() => setConfirmingDecline(true)}
        />
      ) : data.proposalId ? (
        <div className={styles.proposalLink}>
          <Button variant="secondary" to={`/propostas/${data.proposalId}`}>
            Ver proposta
          </Button>
        </div>
      ) : null}
      <ConfirmDialog
        open={confirmingDecline}
        title={`Recusar a solicitação de ${data.service.clientName}?`}
        confirmLabel="Recusar"
        danger
        pending={decline.isPending}
        onConfirm={handleConfirmDecline}
        onClose={() => setConfirmingDecline(false)}
      >
        <p>
          A solicitação passa a recusada e não pode voltar a ser respondida. Esta ação não pode ser
          anulada.
        </p>
      </ConfirmDialog>
    </div>
  );
}
