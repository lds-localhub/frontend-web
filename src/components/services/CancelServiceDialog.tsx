import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type Props = {
  open: boolean;
  serviceTitle: string;
  text?: string; // consequências do cancelamento; sem ele, as do Prestador
  pending: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

const providerText =
  "O serviço passa a cancelado e o cancelamento fica registado no histórico como feito por si. Esta ação não pode ser anulada.";

// Confirmação do cancelamento de um serviço: pelo Prestador com a proposta aceite (na proposta
// enviada e na lista das propostas) ou pelo Cliente, na lista dos seus serviços, com o texto dele
export function CancelServiceDialog({
  open,
  serviceTitle,
  text = providerText,
  pending,
  onConfirm,
  onClose,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      title={`Cancelar o serviço «${serviceTitle}»?`}
      confirmLabel="Cancelar serviço"
      danger
      pending={pending}
      onConfirm={onConfirm}
      onClose={onClose}
    >
      <p>{text}</p>
    </ConfirmDialog>
  );
}
