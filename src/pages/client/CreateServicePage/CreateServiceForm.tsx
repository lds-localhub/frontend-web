import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { Controller, useForm, useWatch, type DefaultValues } from "react-hook-form";
import type { ProposalModel, ServiceInput } from "@/api/types";
import { AddressField } from "@/components/ui/AddressField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DateField } from "@/components/ui/DateField";
import { FormError } from "@/components/ui/FormError";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { applyServerErrors } from "@/utils/forms";
import { CategoryField } from "./CategoryField";
import { CharCount } from "./CharCount";
import { createServiceSchema, type CreateServiceFormValues } from "./createServiceSchema";
import { ProviderSelectionField } from "./ProviderSelectionField";
import styles from "./CreateServiceForm.module.css";

type Props = {
  defaultValues: DefaultValues<CreateServiceFormValues>;
  preselectedProviderId: number | null;
  preselectedProviderInvalid: boolean; // o Prestador do URL está mal escrito ou não existe
  onSubmit: (body: ServiceInput) => Promise<unknown>;
  onCancel: () => void;
};

const modelItems: { value: ProposalModel; label: string }[] = [
  { value: "PUBLIC", label: "Aberto a propostas" },
  { value: "DIRECT_REQUEST", label: "Solicitação direta" },
];

const dateModeItems: { value: "single" | "range"; label: string }[] = [
  { value: "single", label: "Data única" },
  { value: "range", label: "Intervalo de datas" },
];

// Formulário do serviço nas duas modalidades: modalidade, categoria, título, descrição, local,
// disponibilidade e, em solicitação direta, os Prestadores que recebem o pedido
export function CreateServiceForm({
  defaultValues,
  preselectedProviderId,
  preselectedProviderInvalid,
  onSubmit,
  onCancel,
}: Props) {
  // Com o tipo escrito: os valores iniciais são parciais (a categoria pode começar sem valor) e,
  // sem ele, o TypeScript deduziria o tipo do formulário a partir deles e não do esquema
  const form = useForm<CreateServiceFormValues>({
    resolver: zodResolver(createServiceSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues,
  });
  const { control, register, formState } = form;
  const proposalModel = useWatch({ control, name: "proposalModel" });
  const dateMode = useWatch({ control, name: "dateMode" });
  const providersCount = useWatch({ control, name: "providers" }).length;

  // Aberto a propostas não tem destinatários: saem todos os selecionados, até o vindo do perfil
  const handleModelChange = (model: ProposalModel) => {
    form.setValue("proposalModel", model);
    if (model === "PUBLIC") {
      form.setValue("providers", []);
      form.clearErrors("providers");
    }
  };

  const handleValidSubmit = async (v: CreateServiceFormValues) => {
    // Só vai a data final no intervalo e só vão os Prestadores (só os IDs) em solicitação direta
    const body: ServiceInput = {
      proposalModel: v.proposalModel,
      serviceCategoryId: v.serviceCategoryId,
      title: v.title,
      description: v.description,
      location: v.location,
      requestedStartDate: v.requestedStartDate,
      requestedEndDate: v.dateMode === "range" ? v.requestedEndDate : null,
      professionalProfileIds:
        v.proposalModel === "DIRECT_REQUEST"
          ? v.providers.map((p) => p.professionalProfileId)
          : null,
    };
    try {
      await onSubmit(body);
    } catch (e) {
      // Os erros dos Prestadores vêm do backend em professionalProfileIds; aqui o campo é providers
      applyServerErrors(e, form.setError, { professionalProfileIds: "providers" });
    }
  };

  // A pesquisa dos Prestadores usa o local de realização: se não reconhecer a morada, o erro
  // aparece no campo «Local». Só se limpa o erro posto pela pesquisa, nunca o da validação.
  const handleAddressError = useCallback(
    (message: string | undefined) => {
      if (message) {
        form.setError("location", { type: "server", message });
      } else if (form.getFieldState("location").error?.type === "server") {
        form.clearErrors("location");
      }
    },
    [form],
  );

  return (
    <form className={styles.layout} noValidate onSubmit={form.handleSubmit(handleValidSubmit)}>
      <Card>
        <div className={styles.fields}>
          <div className={styles.group}>
            <span className={styles.label}>Modalidade</span>
            <ToggleGroup
              items={modelItems}
              value={proposalModel}
              onValueChange={handleModelChange}
            />
            <p className={styles.hint}>
              {proposalModel === "PUBLIC"
                ? "Todos os Prestadores compatíveis podem enviar proposta."
                : "Só os Prestadores escolhidos recebem o pedido."}
            </p>
          </div>

          <CategoryField control={control} />

          <TextField
            label="Título"
            {...register("title")}
            hint={
              <>
                1 a 100 caracteres · <CharCount control={control} name="title" max={100} />
              </>
            }
            error={formState.errors.title?.message}
          />

          <TextAreaField
            label="Descrição do serviço"
            {...register("description")}
            hint={
              <>
                1 a 1000 caracteres · <CharCount control={control} name="description" max={1000} />
              </>
            }
            error={formState.errors.description?.message}
          />

          <AddressField
            label="Local de realização"
            {...register("location", { deps: ["providers"] })}
            hint="Por omissão, a sua localização registada. Outro endereço não altera a localização registada."
            error={formState.errors.location?.message}
          />

          <div className={styles.group}>
            <span className={styles.label}>Disponibilidade pretendida</span>
            <Controller
              control={control}
              name="dateMode"
              render={({ field }) => (
                <ToggleGroup
                  items={dateModeItems}
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
            {dateMode === "single" ? (
              <div className={styles.singleDate}>
                <DateField
                  label="Data"
                  {...register("requestedStartDate")}
                  hint="Igual ou posterior a hoje."
                  error={formState.errors.requestedStartDate?.message}
                />
              </div>
            ) : (
              <div className={styles.dates}>
                <DateField
                  label="De"
                  {...register("requestedStartDate")}
                  hint="Igual ou posterior a hoje."
                  error={formState.errors.requestedStartDate?.message}
                />
                <DateField
                  label="Até"
                  {...register("requestedEndDate")}
                  hint="Igual ou posterior à data inicial."
                  error={formState.errors.requestedEndDate?.message}
                />
              </div>
            )}
          </div>

          <FormError message={formState.errors.root?.server?.message} />
          <div className={styles.actions}>
            <Button type="submit" disabled={formState.isSubmitting}>
              {proposalModel === "PUBLIC"
                ? "Publicar serviço"
                : `Enviar solicitações (${providersCount})`}
            </Button>
            <Button variant="text" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </div>
      </Card>

      <div className={styles.side}>
        {proposalModel === "DIRECT_REQUEST" ? (
          <ProviderSelectionField
            control={control}
            preselectedProviderId={preselectedProviderId}
            preselectedProviderInvalid={preselectedProviderInvalid}
            onAddressError={handleAddressError}
          />
        ) : (
          <Card>
            <h2 className={styles.sideTitle}>Prestadores</h2>
            <p className={styles.sideText}>
              Escolha «Solicitação direta» para pesquisar e selecionar os Prestadores que recebem o
              pedido.
            </p>
            <div>
              <Button variant="secondary" onClick={() => handleModelChange("DIRECT_REQUEST")}>
                Mudar para Solicitação direta
              </Button>
            </div>
          </Card>
        )}
      </div>
    </form>
  );
}
