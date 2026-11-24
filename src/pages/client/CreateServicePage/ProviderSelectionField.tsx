import { Controller, useWatch, type Control } from "react-hook-form";
import type { CreateServiceFormValues } from "./createServiceSchema";
import { ProviderSelectionPanel } from "./ProviderSelectionPanel";

type Props = {
  control: Control<CreateServiceFormValues>;
  preselectedProviderId: number | null; // Prestador vindo do W12 (?prestador)
  preselectedProviderMissing: boolean; // o Prestador do URL não existe
};

// Liga o painel à lista de Prestadores do formulário e passa-lhe a categoria e o local, que mudam a
// cada tecla: só este componente e o painel voltam a ser desenhados (11.8, 11.9)
export function ProviderSelectionField({
  control,
  preselectedProviderId,
  preselectedProviderMissing,
}: Props) {
  const serviceCategoryId = useWatch({ control, name: "serviceCategoryId" });
  const location = useWatch({ control, name: "location" });

  return (
    <Controller
      control={control}
      name="providers"
      render={({ field, fieldState }) => {
        // Enquanto o Prestador do W12 estiver na seleção (valor derivado, 8.11)
        const preselected = field.value.find(
          (p) => p.professionalProfileId === preselectedProviderId,
        );
        return (
          <ProviderSelectionPanel
            categoryId={serviceCategoryId}
            location={location}
            value={field.value}
            onChange={field.onChange}
            // O Prestador do URL que não existe aparece como erro do campo, igual à categoria que
            // não existe; sai assim que houver alguém selecionado (valor derivado, 8.11)
            error={
              fieldState.error?.message ??
              (preselectedProviderMissing && field.value.length === 0
                ? "O Prestador indicado não existe ou já não está disponível. Selecione outro."
                : undefined)
            }
            notice={
              preselected
                ? `Pedido iniciado no perfil de ${preselected.name}, que já está na seleção.`
                : undefined
            }
          />
        );
      }}
    />
  );
}
