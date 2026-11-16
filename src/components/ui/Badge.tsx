import type { ReactNode } from "react";
import type { Tone } from "@/utils/labels";
import styles from "./Badge.module.css";

type Props = { tone: Tone; children: ReactNode };

// Etiqueta pequena com a cor do tom (ex.: o estado de uma categoria); texto e tom vêm de utils/labels
export function Badge({ tone, children }: Props) {
  return (
    <span className={styles.badge} data-tone={tone}>
      {children}
    </span>
  );
}
