import { Button } from "@/components/ui/Button";
import styles from "./ResponseCard.module.css";

export type ProposalDecisionHandlers = {
  onAccept: (proposalId: number) => void;
  onDecline: (proposalId: number) => void;
  disabled: boolean; // enquanto uma decisão decorre
};

type Props = ProposalDecisionHandlers & { proposalId: number };

// «Aceitar proposta» e «Recusar proposta», à direita do cartão; a confirmação é aberta pela página
export function ProposalDecision({ proposalId, onAccept, onDecline, disabled }: Props) {
  return (
    <div className={styles.decision}>
      <Button onClick={() => onAccept(proposalId)} disabled={disabled}>
        Aceitar proposta
      </Button>
      <Button variant="secondary" onClick={() => onDecline(proposalId)} disabled={disabled}>
        Recusar proposta
      </Button>
    </div>
  );
}
