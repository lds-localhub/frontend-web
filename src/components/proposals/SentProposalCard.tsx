import type { ReactNode } from "react";
import type { ProposalDetail, ProposalStatus, ServiceStatus } from "@/api/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/utils/format";
import { proposalStatusLabels, proposalStatusTone } from "@/utils/labels";
import { ProposalTerms } from "./ProposalTerms";
import styles from "./SentProposalCard.module.css";

type Props = {
  proposal: ProposalDetail;
  children?: ReactNode; // ações por baixo da proposta (ex.: «Cancelar serviço»)
};

// Frase do estado: a proposta aceite depende do que aconteceu depois ao serviço
function statusSentence(proposal: ProposalStatus, service: ServiceStatus): string {
  switch (proposal) {
    case "PENDING":
      return "A aguardar a decisão do Cliente.";
    case "DECLINED":
      return "O Cliente recusou a proposta.";
    case "VOID":
      return "A proposta ficou sem efeito.";
    case "ACCEPTED":
      if (service === "COMPLETED") {
        return "O trabalho foi realizado.";
      }
      return service === "CANCELLED" ? "O serviço foi cancelado." : "O trabalho foi-lhe atribuído.";
  }
}

// «Aceite a …» ou «Recusada a …»; uma proposta sem efeito não tem decisão do Cliente
function decisionText(proposal: ProposalDetail): string | null {
  if (!proposal.decisionDate || proposal.status === "PENDING" || proposal.status === "VOID") {
    return null;
  }
  const label = proposal.status === "ACCEPTED" ? "Aceite" : "Recusada";
  return `${label} a ${formatDate(proposal.decisionDate)}`;
}

// A proposta enviada pelo Prestador: estado, datas, valor, condições, observações e o que se passa
// com ela; só de consulta, porque uma proposta não pode ser alterada depois de enviada
export function SentProposalCard({ proposal, children }: Props) {
  const decision = decisionText(proposal);

  return (
    <Card>
      <div className={styles.card}>
        <div className={styles.heading}>
          <h2 className={styles.title}>A sua proposta</h2>
          <Badge tone={proposalStatusTone[proposal.status]}>
            {proposalStatusLabels[proposal.status]}
          </Badge>
        </div>
        <p className={styles.dates}>
          Enviada {formatDate(proposal.creationDate)}
          {decision && ` · ${decision}`}
        </p>
        <ProposalTerms proposal={proposal} withHeader={false} />
        <p className={styles.sentence}>
          {statusSentence(proposal.status, proposal.service.status)}
        </p>
        {children}
      </div>
    </Card>
  );
}
