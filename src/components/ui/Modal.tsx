import { Dialog } from "@base-ui/react/dialog";
import type { ReactNode } from "react";
import styles from "./Modal.module.css";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  size?: "md" | "lg"; // lg: janela larga, com scroll próprio (ex.: o perfil de um Prestador no W13)
};

// Janela modal com título (ex.: criar ou editar uma categoria); Esc e o clique fora fecham-na
export function Modal({ open, onOpenChange, title, children, size = "md" }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => onOpenChange(next)}>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Popup className={styles.popup} data-size={size}>
          <Dialog.Title className={styles.title}>{title}</Dialog.Title>
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
