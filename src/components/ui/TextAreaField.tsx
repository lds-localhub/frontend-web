import { Field } from "@base-ui/react/field";
import type { ComponentProps } from "react";
import styles from "./TextAreaField.module.css";

type Props = Omit<ComponentProps<"textarea">, "className"> & {
  label: string;
  hint?: string;
  error?: string;
};

// Campo de texto com várias linhas, com etiqueta, dica e mensagem de erro ligadas ao campo.
// Encaminha a ref para o <textarea>, por isso liga-se diretamente com o register do React Hook Form.
// Com required, a etiqueta leva um asterisco; a validação é sempre a do formulário, não a do browser.
export function TextAreaField({ label, hint, error, required, rows = 4, ...textareaProps }: Props) {
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
      <Field.Control
        render={
          <textarea
            {...textareaProps}
            rows={rows}
            aria-required={required}
            className={styles.textarea}
          />
        }
      />
      {hint && !error && <Field.Description className={styles.hint}>{hint}</Field.Description>}
      <Field.Error className={styles.error} match={!!error}>
        {error}
      </Field.Error>
    </Field.Root>
  );
}
