import { Toast } from "@base-ui/react/toast";
import type { ReactNode } from "react";
import styles from "./Toast.module.css";

// Gestor criado fora do React, para o toast() poder ser chamado também fora dos componentes
const toastManager = Toast.createToastManager();

// Mostra uma mensagem curta num canto do ecrã, que desaparece sozinha.
// Fica junto do provider porque os dois partilham o mesmo gestor.
// eslint-disable-next-line react-refresh/only-export-components
export function toast(message: string): void {
  toastManager.add({ description: message });
}

// Provider dos toasts, à volta de toda a aplicação; sem ele, o toast() não mostra nada
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <Toast.Provider toastManager={toastManager}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className={styles.viewport}>
          <Toasts />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

function Toasts() {
  const { toasts } = Toast.useToastManager();
  return toasts.map((t) => (
    <Toast.Root key={t.id} toast={t} className={styles.toast}>
      <Toast.Description className={styles.description} />
      <Toast.Close className={styles.close}>×</Toast.Close>
    </Toast.Root>
  ));
}
