import { Field } from "@base-ui/react/field";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import type { Ref } from "react";
import styles from "./NumberField.module.css";

type Props = {
  label: string;
  name: string;
  value: number | null;
  onValueChange: (value: number | null) => void;
  onBlur?: () => void;
  inputRef?: Ref<HTMLInputElement>; // ex.: o field.ref do Controller, para o formulário pôr o foco no campo com erro
  min?: number;
  max?: number;
  step?: number;
  format?: Intl.NumberFormatOptions;
  suffix?: string;
  wide?: boolean;
  fullWidth?: boolean; // ocupa a largura toda (ex.: ao lado de outro campo numa linha)
  required?: boolean;
  hint?: string;
  error?: string;
};

// Campo numérico com etiqueta, dica e erro; devolve um número (ou null, vazio) e aceita a vírgula decimal.
// Liga-se com o Controller do React Hook Form, porque o valor não vem de um evento de <input>.
export function NumberField({
  label,
  name,
  value,
  onValueChange,
  onBlur,
  inputRef,
  min,
  max,
  step,
  format,
  suffix,
  wide,
  fullWidth,
  required,
  hint,
  error,
}: Props) {
  return (
    <Field.Root className={styles.field} invalid={!!error}>
      <Field.Label className={styles.label}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
      </Field.Label>
      <BaseNumberField.Root
        name={name}
        value={value}
        onValueChange={(v) => onValueChange(v)}
        min={min}
        max={max}
        // Um valor escrito fora dos limites fica como está, para o formulário mostrar o erro em vez de o
        // corrigir sem avisar; as setas continuam a respeitar os limites
        allowOutOfRange
        step={step}
        format={format}
        locale="pt-PT"
      >
        <BaseNumberField.Group className={styles.group}>
          <BaseNumberField.Input
            ref={inputRef}
            className={styles.input}
            onBlur={onBlur}
            aria-required={required}
            data-wide={wide || undefined}
            data-full-width={fullWidth || undefined}
          />
          {suffix && <span className={styles.suffix}>{suffix}</span>}
        </BaseNumberField.Group>
      </BaseNumberField.Root>
      {hint && !error && <Field.Description className={styles.hint}>{hint}</Field.Description>}
      <Field.Error className={styles.error} match={!!error}>
        {error}
      </Field.Error>
    </Field.Root>
  );
}
