import { getErrorMessage } from "@/utils/errors";

type Props = {
  error: unknown;
  onRetry: () => void;
  retrying: boolean;
};

// Erro numa leitura: mostra a mensagem (detail do backend ou indisponibilidade) e «Tentar outra vez»,
// desativado enquanto a nova tentativa decorre.
export function ErrorState({ error, onRetry, retrying }: Props) {
  return (
    <div role="alert">
      <p>{getErrorMessage(error)}</p>
      <button type="button" onClick={onRetry} disabled={retrying}>
        Tentar outra vez
      </button>
    </div>
  );
}
