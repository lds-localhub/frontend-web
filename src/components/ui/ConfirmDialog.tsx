import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Check, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";
import styles from "./ConfirmDialog.module.css";

type Props = {
  open: boolean;
  title: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  pending: boolean;
  danger?: boolean;
  children: ReactNode;
};

// Confirmação de uma ação, com as suas consequências (children). Enquanto a ação decorre, os botões
// ficam desativados e a janela não fecha; quem a usa fecha-a quando a ação termina.
export function ConfirmDialog({
  open,
  title,
  confirmLabel,
  onConfirm,
  onClose,
  pending,
  danger = false,
  children,
}: Props) {
  const handleOpenChange = (next: boolean) => {
    if (!next && !pending) {
      onClose();
    }
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={handleOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className={styles.backdrop} />
        <AlertDialog.Popup className={styles.popup}>
          <span className={styles.icon} data-danger={danger || undefined}>
            {danger ? (
              <TriangleAlert size={20} aria-hidden="true" />
            ) : (
              <Check size={20} aria-hidden="true" />
            )}
          </span>
          <AlertDialog.Title className={styles.title}>{title}</AlertDialog.Title>
          <AlertDialog.Description render={<div />} className={styles.description}>
            {children}
          </AlertDialog.Description>
          <div className={styles.actions}>
            <Button variant="text" onClick={onClose} disabled={pending}>
              Voltar
            </Button>
            <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} disabled={pending}>
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
