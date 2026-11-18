import { Checkbox } from "@base-ui/react/checkbox";
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { Fieldset } from "@base-ui/react/fieldset";
import { Check, Plus } from "lucide-react";
import styles from "./CheckboxGroup.module.css";

type Option<T extends string> = { value: T; label: string; disabled?: boolean };

type Props<T extends string> = {
  label: string;
  value: T[];
  onValueChange: (value: T[]) => void;
  options: Option<T>[];
  required?: boolean;
  hint?: string;
  error?: string;
};

// Escolha múltipla entre opções todas visíveis, desenhadas como etiquetas (ex.: as categorias do perfil)
export function CheckboxGroup<T extends string>({
  label,
  value,
  onValueChange,
  options,
  required,
  hint,
  error,
}: Props<T>) {
  return (
    <Fieldset.Root className={styles.fieldset}>
      <Fieldset.Legend className={styles.legend}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
      </Fieldset.Legend>
      <BaseCheckboxGroup
        value={value}
        onValueChange={(v) => onValueChange(v as T[])}
        className={styles.group}
      >
        {options.map((option) => (
          <Checkbox.Root
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className={styles.chip}
          >
            {/* «+» por escolher e «✓» escolhida; o indicador fica sempre montado para mostrar um dos dois */}
            <Checkbox.Indicator keepMounted className={styles.indicator}>
              <Plus className={styles.plus} size={14} aria-hidden="true" />
              <Check className={styles.check} size={14} aria-hidden="true" />
            </Checkbox.Indicator>
            {option.label}
          </Checkbox.Root>
        ))}
      </BaseCheckboxGroup>
      {hint && !error && <p className={styles.hint}>{hint}</p>}
      {error && <p className={styles.error}>{error}</p>}
    </Fieldset.Root>
  );
}
