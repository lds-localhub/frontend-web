import { Controller, useWatch, type Control } from "react-hook-form";
import { CategorySelect } from "@/components/categories/CategorySelect";
import type { CreateServiceFormValues } from "./createServiceSchema";

type Props = { control: Control<CreateServiceFormValues> };

// Categoria do serviço, limitada às categorias que todos os Prestadores selecionados têm
// (RF-F009-03, regra 7): mudar de categoria nunca invalida a seleção. Só este componente volta a ser
// desenhado quando a seleção muda (11.8).
export function CategoryField({ control }: Props) {
  const providers = useWatch({ control, name: "providers" });

  // Categorias comuns a todos os selecionados; sem selecionados, sem limite
  let onlyIds: number[] | undefined;
  if (providers.length > 0) {
    onlyIds = providers[0].serviceCategoryIds;
    for (const p of providers) {
      onlyIds = onlyIds.filter((id) => p.serviceCategoryIds.includes(id));
    }
  }

  return (
    <Controller
      control={control}
      name="serviceCategoryId"
      render={({ field, fieldState }) => (
        <CategorySelect
          value={field.value}
          onValueChange={field.onChange}
          onlyIds={onlyIds}
          hint={"Só categorias dos Prestadores selecionados."}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
