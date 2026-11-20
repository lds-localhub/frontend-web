import { Checkbox } from "@base-ui/react/checkbox";
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { Fieldset } from "@base-ui/react/fieldset";
import { Check, Plus } from "lucide-react";
import { type Ref, useId } from "react";
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
  focusRef?: Ref<HTMLElement>; // ex.: o field.ref do Controller, para o formulário pôr o foco na primeira opção
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
  focusRef,
}: Props<T>) {
  const hintId = useId();
  const errorId = useId();
  const describedBy = [hint && !error && hintId, error && errorId].filter(Boolean).join(" ");

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
        aria-describedby={describedBy || undefined}
      >
        {options.map((option, index) => (
          <Checkbox.Root
            key={option.value}
            ref={index === 0 ? focusRef : undefined}
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
      {hint && !error && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </Fieldset.Root>
  );
}
