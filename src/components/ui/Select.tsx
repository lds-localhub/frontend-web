import { Field } from "@base-ui/react/field";
import { Select as BaseSelect } from "@base-ui/react/select";
import { ChevronDown } from "lucide-react";
import styles from "./Select.module.css";

export type SelectOption = { value: string; label: string };

type Props = {
  label: string;
  items: SelectOption[];
  value: string | undefined;
  onValueChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
};

// Seletor dos formulários, com etiqueta, dica e mensagem de erro ligadas ao seletor
// (anunciadas pelo leitor de ecrã). Sem valor escolhido, mostra o placeholder.
export function Select({
  label,
  items,
  value,
  onValueChange,
  placeholder,
  hint,
  error,
  disabled,
}: Props) {
  return (
    <Field.Root className={styles.field} invalid={!!error} disabled={disabled}>
      <BaseSelect.Root
        items={items}
        value={value ?? null}
        onValueChange={(next: string | null) => {
          if (next !== null) onValueChange(next);
        }}
      >
        <BaseSelect.Label className={styles.label}>{label}</BaseSelect.Label>
        <BaseSelect.Trigger className={styles.trigger}>
          <BaseSelect.Value className={styles.value} placeholder={placeholder} />
          <BaseSelect.Icon className={styles.icon}>
            <ChevronDown size={16} />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal>
          <BaseSelect.Positioner
            className={styles.positioner}
            sideOffset={6}
            alignItemWithTrigger={false}
          >
            <BaseSelect.Popup className={styles.popup}>
              <BaseSelect.List>
                {items.map((item) => (
                  <BaseSelect.Item key={item.value} value={item.value} className={styles.item}>
                    <BaseSelect.ItemText>{item.label}</BaseSelect.ItemText>
                  </BaseSelect.Item>
                ))}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
      {hint && !error && <Field.Description className={styles.hint}>{hint}</Field.Description>}
      <Field.Error className={styles.error} match={!!error}>
        {error}
      </Field.Error>
    </Field.Root>
  );
}
