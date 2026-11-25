import { Switch as BaseSwitch } from "@base-ui/react/switch";
import styles from "./Switch.module.css";

type Props = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

// Interruptor com a etiqueta ao lado (ex.: «Só dentro do meu raio»); carregar na etiqueta também o muda
export function Switch({ label, checked, onCheckedChange }: Props) {
  return (
    <label className={styles.label}>
      <BaseSwitch.Root
        className={styles.root}
        checked={checked}
        onCheckedChange={(next) => onCheckedChange(next)}
      >
        <BaseSwitch.Thumb className={styles.thumb} />
      </BaseSwitch.Root>
      {label}
    </label>
  );
}
