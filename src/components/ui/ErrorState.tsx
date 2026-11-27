import { CircleAlert, RotateCw } from "lucide-react";
import { getErrorMessage } from "@/utils/errors";
import { Button } from "./Button";
import styles from "./ErrorState.module.css";

type Props = {
  error: unknown;
  onRetry: () => void;
  retrying: boolean;
};

// Erro numa leitura: mostra a mensagem (detail do backend ou indisponibilidade) e «Tentar outra vez»,
// desativado enquanto a nova tentativa decorre.
export function ErrorState({ error, onRetry, retrying }: Props) {
  return (
    <div className={styles.error}>
      <CircleAlert className={styles.icon} size={22} />
      <p className={styles.message}>{getErrorMessage(error)}</p>
      <Button variant="secondary" onClick={onRetry} disabled={retrying}>
        <RotateCw size={14} />
        Tentar outra vez
      </Button>
    </div>
  );
}
