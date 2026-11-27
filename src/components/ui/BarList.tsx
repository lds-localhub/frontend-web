import type { CSSProperties } from "react";
import type { Tone } from "@/utils/labels";
import styles from "./BarList.module.css";

type Props = { items: { label: string; value: number; tone?: Tone }[] };

// Barras horizontais com o nome, a barra proporcional ao maior valor e o número (ex.: as distribuições
// dos relatórios); sem tom, a barra tem a cor principal
export function BarList({ items }: Props) {
  const max = Math.max(...items.map((i) => i.value), 1); // com todos a 0, evita dividir por 0
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.label} className={styles.row}>
          <span className={styles.label}>{item.label}</span>
          <span className={styles.track}>
            <span
              className={styles.bar}
              data-tone={item.tone}
              style={{ "--value": `${(item.value / max) * 100}%` } as CSSProperties}
            />
          </span>
          <strong className={styles.value}>{item.value}</strong>
        </li>
      ))}
    </ul>
  );
}
