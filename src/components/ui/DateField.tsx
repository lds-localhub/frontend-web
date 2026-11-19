import type { ComponentProps } from "react";
import { TextField } from "./TextField";

type Props = Omit<ComponentProps<typeof TextField>, "type">;

// Campo de data (<input type="date">) com etiqueta, dica e mensagem de erro; o valor é AAAA-MM-DD,
// ou vazio sem data
export function DateField(props: Props) {
  return <TextField {...props} type="date" />;
}
