import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type Props = {
  open: boolean;
  serviceTitle: string;
  pending: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

// Confirmação do cancelamento de um serviço atribuído, feito pelo Prestador com a proposta aceite
// (na proposta enviada e na lista das propostas)
export function CancelServiceDialog({ open, serviceTitle, pending, onConfirm, onClose }: Props) {
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
      <p>
        O serviço passa a cancelado e o cancelamento fica registado no histórico como feito por si.
        Esta ação não pode ser anulada.
      </p>
    </ConfirmDialog>
  );
}
