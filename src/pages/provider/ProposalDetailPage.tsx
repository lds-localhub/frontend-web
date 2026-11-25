import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { CancelServiceDialog } from "@/components/proposals/CancelServiceDialog";
import { SentProposalCard } from "@/components/proposals/SentProposalCard";
import { ServiceInfoCard } from "@/components/services/ServiceInfoCard";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loading } from "@/components/ui/Loading";
import { toast } from "@/components/ui/Toast";
import { useCancelService } from "@/hooks/useCancelService";
import { useProposal } from "@/hooks/useProposal";
import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { parseId } from "@/utils/parseId";
import styles from "./ServiceAndProposal.module.css";

// Proposta enviada pelo Prestador, só de consulta, com o serviço e o Cliente; com a proposta aceite e
// o serviço atribuído, o Prestador pode cancelar o serviço
export function ProposalDetailPage() {
  const id = parseId(useParams().proposalId);
  const navigate = useNavigate();
  const location = useLocation();
  const proposal = useProposal(id);
  const cancel = useCancelService();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Aberto diretamente, sem página anterior na aplicação, volta à lista das propostas
  const handleBackClick = () => {
    if (location.key === "default") {
      navigate("/propostas");
    } else {
      navigate(-1);
    }
  };

  // O ID é verificado antes do loading: com um ID inválido a query fica desligada e nunca sairia dele
  if (id === null) {
    return <NotFoundPage />;
  }
  if (proposal.isPending) {
    return <Loading />;
  }
  if (proposal.isError) {
    return (
      <ErrorState
        error={proposal.error}
        onRetry={proposal.refetch}
        retrying={proposal.isFetching}
      />
    );
  }

  const { data } = proposal;
  const canCancel = data.status === "ACCEPTED" && data.service.status === "ASSIGNED";

  // A janela fecha quando a ação termina; com sucesso, a frase passa a «O serviço foi cancelado.»
  const handleConfirmCancel = () =>
    cancel.mutate(data.service.serviceId, {
      onSuccess: () => toast("Serviço cancelado."),
      onSettled: () => setConfirmOpen(false),
    });

  return (
    <div className={styles.page}>
      <title>Proposta enviada · LocalHub</title>
      <BackLink onClick={handleBackClick}>As minhas propostas</BackLink>
      <div className={styles.columns}>
        <ServiceInfoCard service={data.service} clientName={data.service.clientName} />
        <div className={styles.side}>
          <SentProposalCard proposal={data}>
            {canCancel && (
              <Button
                variant="danger-outline"
                disabled={proposal.isFetching || cancel.isPending}
                onClick={() => setConfirmOpen(true)}
              >
                Cancelar serviço
              </Button>
            )}
          </SentProposalCard>
        </div>
      </div>
      <CancelServiceDialog
        open={confirmOpen}
        serviceTitle={data.service.title}
        pending={cancel.isPending}
        onConfirm={handleConfirmCancel}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
