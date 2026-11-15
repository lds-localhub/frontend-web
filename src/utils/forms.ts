import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { isApiError } from "./errors";

// Põe os erros de campo do backend (de um 400 ou de um 409, ex.: e-mail já registado) nos campos do
// formulário; um 400 sem erros de campo vai para o erro geral (root.server). Os outros erros são
// mostrados pelo onError da mutação.
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  // nome no backend → nome no formulário, quando o campo do formulário guarda outra coisa
  renames: Partial<Record<string, Path<T>>> = {},
): void {
  if (!isApiError(error)) return;
  if (error.errors) {
    for (const [key, messages] of Object.entries(error.errors)) {
      // Os erros de um elemento de uma lista (ex.: serviceCategoryIds[0]) vão para o campo da lista
      const field = key.replace(/\[\d+\]$/, "");
      setError(renames[field] ?? (field as Path<T>), { type: "server", message: messages[0] });
    }
    return;
  }
  if (error.status === 400) {
    setError("root.server", { message: error.detail });
  }
}
