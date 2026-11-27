import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import styles from "./ToggleGroup.module.css";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  items: Option<T>[];
  value: T;
  onValueChange: (value: T) => void;
};

// Controlo segmentado: uma só opção escolhida, sempre uma (ex.: a modalidade do serviço; data única
// ou intervalo). Carregar na opção já escolhida não a desmarca.
export function ToggleGroup<T extends string>({ items, value, onValueChange }: Props<T>) {
  return (
    <BaseToggleGroup
      className={styles.group}
      value={[value]}
      onValueChange={(values) => {
        const next = items.find((item) => item.value === values[0]);
        if (next) onValueChange(next.value);
      }}
    >
      {items.map((item) => (
        <Toggle key={item.value} value={item.value} className={styles.item}>
          {item.label}
        </Toggle>
      ))}
    </BaseToggleGroup>
  );
}
