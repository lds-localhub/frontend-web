import { Field } from "@base-ui/react/field";
import type { ComponentProps, ReactNode } from "react";
import styles from "./TextField.module.css";

type Props = Omit<ComponentProps<"input">, "className"> & {
  label: string;
  hint?: ReactNode; // texto, ou texto com um contador (ex.: «1 a 100 caracteres · 24/100»)
  error?: string;
};

// Campo de texto com etiqueta, dica e mensagem de erro ligadas ao campo (anunciadas pelo leitor de ecrã).
// Encaminha a ref para o <input>, por isso liga-se diretamente com o register do React Hook Form.
// Com required, a etiqueta leva um asterisco; a validação é sempre a do formulário, não a do browser.
export function TextField({ label, hint, error, required, ...inputProps }: Props) {
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
      <Field.Control {...inputProps} aria-required={required} className={styles.input} />
      {hint && <Field.Description className={styles.hint}>{hint}</Field.Description>}
      <Field.Error className={styles.error} match={!!error}>
        {error}
      </Field.Error>
    </Field.Root>
  );
}
