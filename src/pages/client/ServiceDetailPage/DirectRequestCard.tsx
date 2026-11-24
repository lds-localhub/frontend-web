import type { ServiceDirectRequest } from "@/api/types";
import { ProposalTerms } from "@/components/proposals/ProposalTerms";
import { formatDate } from "@/utils/format";
import { directRequestStatusLabels, directRequestStatusTone } from "@/utils/labels";
import { ProviderSide } from "./ProviderSide";
import styles from "./ResponseCard.module.css";

type Props = {
  request: ServiceDirectRequest;
  acceptedProviderName: string | undefined; // Prestador da proposta aceite no serviço, se houver
  voidedByCancellationAt: string | undefined; // data do cancelamento, se foi cancelado ainda aberto
};

// Uma solicitação direta (W15): o Prestador e o estado à esquerda; ao centro a proposta ou, sem
// proposta, a mensagem do estado (textos do protótipo). Só de consulta: aceitar e recusar ficam para
// a tarefa C.
export function DirectRequestCard({
  request,
  acceptedProviderName,
  voidedByCancellationAt,
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

  return (
    <article className={styles.card}>
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
    </article>
  );
}
