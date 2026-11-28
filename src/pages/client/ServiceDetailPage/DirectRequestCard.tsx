import type { ServiceDirectRequest } from "@/api/types";
import { ProposalTerms } from "@/components/proposals/ProposalTerms";
import { formatDate } from "@/utils/format";
import { directRequestStatusLabels, directRequestStatusTone } from "@/utils/labels";
import { ProposalDecision, type ProposalDecisionHandlers } from "./ProposalDecision";
import { ProviderSide } from "./ProviderSide";
import styles from "./ResponseCard.module.css";

type Props = {
  request: ServiceDirectRequest;
  acceptedProviderName: string | undefined; // Prestador da proposta aceite no serviço, se houver
  voidedByCancellationAt: string | undefined; // data do cancelamento, se foi cancelado ainda aberto
  decision?: ProposalDecisionHandlers; // só com o serviço aberto: aceitar e recusar a proposta pendente
};

// Uma solicitação direta: o Prestador e o estado à esquerda; ao centro a proposta ou, sem
// proposta, a mensagem do estado; com a proposta pendente e o serviço aberto,
// «Aceitar proposta» e «Recusar proposta».
export function DirectRequestCard({
  request,
  acceptedProviderName,
  voidedByCancellationAt,
  decision,
}: Props) {
  const { proposal } = request;
  const dates =
    `Enviada ${formatDate(request.creationDate)}` +
    (request.responseDate ? ` · Respondida ${formatDate(request.responseDate)}` : "");

  let statusNote: string | undefined;
  if (proposal?.status === "ACCEPTED" && proposal.decisionDate) {
    statusNote = `Aceite a ${formatDate(proposal.decisionDate)}`;
  } else if (proposal?.status === "VOID" && voidedByCancellationAt) {
    statusNote = `Sem efeito a ${formatDate(proposal.decisionDate ?? voidedByCancellationAt)} (serviço cancelado)`;
  }

  const messages: Record<ServiceDirectRequest["status"], string> = {
    PENDING: "A aguardar resposta do Prestador.",
    PROPOSAL_SUBMITTED: "",
    DECLINED: "O Prestador recusou a solicitação.",
    VOID: acceptedProviderName
      ? `Ficou sem efeito quando aceitou a proposta de ${acceptedProviderName}.`
      : "Ficou sem efeito quando cancelou o serviço.",
  };

  const canDecide = decision !== undefined && proposal?.status === "PENDING";

  return (
    <article className={styles.card} data-decision={canDecide || undefined}>
      <ProviderSide
        provider={request.professionalProfile}
        status={{
          label: directRequestStatusLabels[request.status],
          tone: directRequestStatusTone[request.status],
        }}
        dates={dates}
      />
      {proposal ? (
        <ProposalTerms proposal={proposal} withHeader statusNote={statusNote} />
      ) : (
        <p className={styles.message}>{messages[request.status]}</p>
      )}
      {canDecide && <ProposalDecision proposalId={proposal.proposalId} {...decision} />}
    </article>
  );
}
