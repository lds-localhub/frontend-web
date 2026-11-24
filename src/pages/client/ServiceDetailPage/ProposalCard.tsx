import type { ServiceProposal } from "@/api/types";
import { ProposalTerms } from "@/components/proposals/ProposalTerms";
import { formatDate } from "@/utils/format";
import { proposalStatusLabels, proposalStatusTone } from "@/utils/labels";
import { ProviderSide } from "./ProviderSide";
import styles from "./ResponseCard.module.css";

type Props = {
  proposal: ServiceProposal;
  voidedByCancellationAt: string | undefined; // data do cancelamento, se foi cancelado ainda aberto
};

// Uma proposta a um serviço aberto a propostas (W18): o Prestador, o estado e as datas à esquerda e
// a proposta ao centro. Só de consulta: aceitar e recusar ficam para a tarefa C.
export function ProposalCard({ proposal, voidedByCancellationAt }: Props) {
  let dates = `Enviada ${formatDate(proposal.creationDate)}`;
  if (proposal.status === "VOID" && voidedByCancellationAt) {
    dates += ` · Sem efeito a ${formatDate(proposal.decisionDate ?? voidedByCancellationAt)} (serviço cancelado)`;
  } else if (proposal.decisionDate) {
    dates += ` · Decidida a ${formatDate(proposal.decisionDate)}`;
  }

  return (
    <article className={styles.card}>
      <ProviderSide
        provider={proposal.professionalProfile}
        status={{
          label: proposalStatusLabels[proposal.status],
          tone: proposalStatusTone[proposal.status],
        }}
        dates={dates}
      />
      <ProposalTerms proposal={proposal} withHeader={false} />
    </article>
  );
}
