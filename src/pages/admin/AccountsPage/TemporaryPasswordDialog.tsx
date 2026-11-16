import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Modal } from "@/components/ui/Modal";
import styles from "./TemporaryPasswordDialog.module.css";

type Props = {
  accountName: string;
  temporaryPassword: string | undefined;
  onClose: () => void;
};

// Janela com a palavra-passe temporária devolvida pela redefinição.
// Só está aberta enquanto houver palavra-passe; ao fechar, quem a usa apaga-a e ela não volta a aparecer.
export function TemporaryPasswordDialog({ accountName, temporaryPassword, onClose }: Props) {
  return (
    <Modal
      open={temporaryPassword !== undefined}
      onOpenChange={(open) => !open && onClose()}
      title="Palavra-passe redefinida"
    >
      <p>
        Palavra-passe temporária de <strong>{accountName}</strong>:
      </p>
      <p className={styles.password}>{temporaryPassword}</p>
      <Callout tone="warning">
        <strong>Esta palavra-passe só é mostrada uma vez.</strong> Comunique-a ao utilizador pelo
        contacto de suporte, em resposta ao pedido, e recomende que a altere depois de iniciar
        sessão. As sessões da conta foram terminadas.
      </Callout>
      <div className={styles.actions}>
        <Button onClick={onClose}>Fechar</Button>
      </div>
    </Modal>
  );
}
