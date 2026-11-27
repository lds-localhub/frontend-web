import { useWatch, type Control } from "react-hook-form";
import type { CreateServiceFormValues } from "./createServiceSchema";

type Props = {
  control: Control<CreateServiceFormValues>;
  name: "title" | "description";
  max: number;
};

// Contador «24/100» de um campo de texto. Fica num componente à parte para só ele voltar a ser
// desenhado a cada tecla, e não o formulário inteiro
export function CharCount({ control, name, max }: Props) {
  const value = useWatch({ control, name });
  return (
    <span>
      {value.length}/{max}
    </span>
  );
}
