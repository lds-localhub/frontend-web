import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type { ReactNode } from "react";
import styles from "./Tooltip.module.css";

type Props = {
  content: ReactNode;
  label: string; // nome do botão para o leitor de ecrã (ex.: «2 alertas»)
  children: ReactNode;
};

// Dica que aparece ao passar o cursor ou ao chegar com o teclado ao botão (ex.: o detalhe dos alertas)
export function Tooltip({ content, label, children }: Props) {
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger className={styles.trigger} aria-label={label} delay={150}>
        {children}
      </BaseTooltip.Trigger>
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner className={styles.positioner} side="right" sideOffset={8}>
          <BaseTooltip.Popup className={styles.popup}>{content}</BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
