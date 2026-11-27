import { useLayoutEffect, useRef, useState } from "react";
import type { ServiceDirectRequestProposal } from "@/api/types";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/utils/format";
import { proposalStatusLabels, proposalStatusTone } from "@/utils/labels";
import styles from "./ProposalTerms.module.css";

type Props = {
  proposal: ServiceDirectRequestProposal;
  withHeader: boolean; // «Proposta» e o estado por cima do valor (solicitação direta, W15)
  statusNote?: string; // ao lado do estado (ex.: «Aceite a 30/09/2026»)
};

// Texto cortado a três linhas, com «Ver mais» só se não couber: mede o parágrafo cortado sempre que
// a largura muda (ex.: janela mais estreita)
function LongText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const observer = new ResizeObserver(() => {
      if (!el.hasAttribute("data-clamped")) {
        return; // aberto, não há corte para medir
      }
      setOverflows(el.scrollHeight > el.clientHeight + 1);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <p ref={ref} className={styles.text} data-clamped={!expanded || undefined}>
        {text}
      </p>
      {(overflows || expanded) && (
        <button
          type="button"
          className={styles.more}
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Ver menos" : "Ver mais"}
        </button>
      )}
    </>
  );
}

// Valor, condições e observações de uma proposta
export function ProposalTerms({ proposal, withHeader, statusNote }: Props) {
  return (
    <div className={styles.terms}>
      {withHeader && (
        <div className={styles.header}>
          <span className={styles.label}>Proposta</span>
          <Badge tone={proposalStatusTone[proposal.status]}>
            {proposalStatusLabels[proposal.status]}
          </Badge>
          {statusNote && <span className={styles.note}>{statusNote}</span>}
        </div>
      )}
      <p className={styles.amount}>{formatCurrency(proposal.amount)}</p>
      <div>
        <h3 className={styles.label}>Condições</h3>
        <LongText text={proposal.conditions} />
      </div>
      {proposal.obs && (
        <div>
          <h3 className={styles.label}>Observações</h3>
          <LongText text={proposal.obs} />
        </div>
      )}
    </div>
  );
}
