import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { isApiError } from "./errors";

// Põe os erros de campo de um 400 nos campos do formulário; um 400 sem erros de campo vai para o
// formulário (root.server). Os outros erros são mostrados pelo onError da mutação.
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): void {
  if (!isApiError(error) || error.status !== 400) return;
  if (!error.errors) {
    setError("root.server", { message: error.detail });
    return;
  }
  for (const [field, messages] of Object.entries(error.errors)) {
    setError(field as Path<T>, { type: "server", message: messages[0] });
  }
}
