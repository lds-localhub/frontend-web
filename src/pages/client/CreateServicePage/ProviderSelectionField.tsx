import { Controller, useWatch, type Control } from "react-hook-form";
import type { CreateServiceFormValues } from "./createServiceSchema";
import { ProviderSelectionPanel } from "./ProviderSelectionPanel";

type Props = {
  control: Control<CreateServiceFormValues>;
  preselectedProviderId: number | null; // Prestador vindo do perfil (?professionalProfileId)
  preselectedProviderInvalid: boolean; // o Prestador do URL está mal escrito ou não existe
  onAddressError: (message: string | undefined) => void; // morada não reconhecida pela pesquisa
};

// Liga o painel ao campo dos Prestadores do formulário. A categoria e o local mudam a cada tecla:
// lê-los aqui faz com que só este componente e o painel voltem a ser desenhados
export function ProviderSelectionField({
  control,
  preselectedProviderId,
  preselectedProviderInvalid,
  onAddressError,
}: Props) {
  const serviceCategoryId = useWatch({ control, name: "serviceCategoryId" });
  const location = useWatch({ control, name: "location" });

  return (
    <Controller
      control={control}
      name="providers"
      render={({ field, fieldState }) => {
        // Enquanto o Prestador vindo do perfil estiver na seleção (calculado a cada desenho)
        const preselected = field.value.find(
          (p) => p.professionalProfileId === preselectedProviderId,
        );
        return (
          <ProviderSelectionPanel
            categoryId={serviceCategoryId}
            location={location}
            onAddressError={onAddressError}
            value={field.value}
            onChange={field.onChange}
            // O Prestador do URL mal escrito ou que não existe aparece como erro do campo, até
            // haver alguém selecionado
            error={
              fieldState.error?.message ??
              (preselectedProviderInvalid && field.value.length === 0
                ? "O Prestador indicado não existe ou já não está disponível."
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
