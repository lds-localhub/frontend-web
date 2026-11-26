import type { ServiceProposal } from "@/api/types";
import { ProposalTerms } from "@/components/proposals/ProposalTerms";
import { formatDate } from "@/utils/format";
import { proposalStatusLabels, proposalStatusTone } from "@/utils/labels";
import { ProposalDecision, type ProposalDecisionHandlers } from "./ProposalDecision";
import { ProviderSide } from "./ProviderSide";
import styles from "./ResponseCard.module.css";

type Props = {
  proposal: ServiceProposal;
  voidedByCancellationAt: string | undefined; // data do cancelamento, se foi cancelado ainda aberto
  decision?: ProposalDecisionHandlers; // só com o serviço aberto: aceitar e recusar as pendentes
};

// Uma proposta a um serviço aberto a propostas (W18): o Prestador, o estado e as datas à esquerda e
// a proposta ao centro; pendente e com o serviço aberto, «Aceitar proposta» e «Recusar proposta».
export function ProposalCard({ proposal, voidedByCancellationAt, decision }: Props) {
  let dates = `Enviada ${formatDate(proposal.creationDate)}`;
  if (proposal.status === "VOID" && voidedByCancellationAt) {
    dates += ` · Sem efeito a ${formatDate(proposal.decisionDate ?? voidedByCancellationAt)} (serviço cancelado)`;
  } else if (proposal.decisionDate) {
    dates += ` · Decidida a ${formatDate(proposal.decisionDate)}`;
  }

  const canDecide = decision !== undefined && proposal.status === "PENDING";

  return (
    <article className={styles.card} data-decision={canDecide || undefined}>
      <ProviderSide
        provider={proposal.professionalProfile}
        status={{
          label: proposalStatusLabels[proposal.status],
          tone: proposalStatusTone[proposal.status],
        }}
        dates={dates}
      />
      <ProposalTerms proposal={proposal} withHeader={false} />
      {canDecide && <ProposalDecision proposalId={proposal.proposalId} {...decision} />}
    </article>
  );
}
