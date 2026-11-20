import type { ComponentProps } from "react";
import { TextField } from "./TextField";

type Props = Omit<ComponentProps<typeof TextField>, "label"> & { label?: string };

// Campo da morada, escrita à mão: o backend converte-a em coordenadas e devolve o erro no campo
// quando não a reconhece. Liga-se com o register do React Hook Form, como o TextField.
export function AddressField({ label = "Morada", ...props }: Props) {
  return (
    <TextField
      label={label}
      placeholder="Rua, número, localidade"
      autoComplete="street-address"
      maxLength={255}
      {...props}
    />
  );
}
