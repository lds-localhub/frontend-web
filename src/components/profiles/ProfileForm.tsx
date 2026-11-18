import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CategoryRef, ProfileInput } from "@/api/types";
import { applyServerErrors } from "@/utils/forms";
import { Card } from "@/components/ui/Card";
import { AddressField } from "@/components/ui/AddressField";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { NumberField } from "@/components/ui/NumberField";
import { Button } from "@/components/ui/Button";
import { useCategories } from "@/hooks/useCategories";
import { Loading } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { FormError } from "@/components/ui/FormError";
import styles from "./ProfileForm.module.css";

const profileSchema = z.object({
  introduction: z
    .string()
    .trim()
    .min(1, "Indique a apresentação.")
    .max(1000, "A apresentação tem, no máximo, 1000 caracteres."),
  contactDetails: z
    .string()
    .trim()
    .min(1, "Indique os contactos.")
    .max(500, "Os contactos têm, no máximo, 500 caracteres."),
  experience: z
    .string()
    .trim()
    .min(1, "Indique a experiência.")
    .max(2000, "A experiência tem, no máximo, 2000 caracteres."),
  serviceCategoryIds: z.array(z.number()).min(1, "Indique pelo menos uma categoria de serviços."),
  address: z
    .string()
    .trim()
    .min(1, "Indique a morada.")
    .max(255, "A morada tem, no máximo, 255 caracteres."),
  serviceRadiusKm: z
    .number({ error: "Indique o raio de atuação." })
    .int("O raio de atuação é um número inteiro.")
    .min(1, "O raio de atuação tem de estar entre 1 e 100 km.")
    .max(100, "O raio de atuação tem de estar entre 1 e 100 km."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type Props = {
  defaultValues?: ProfileFormValues;
  currentCategories?: CategoryRef[];
  onSubmit: (body: ProfileInput) => Promise<unknown>;
  onCancel?: () => void;
  submitLabel: string;
};

// Formulário do perfil profissional, comum à criação e à edição; os erros do backend vão para os campos
export default function ProfileForm({
  defaultValues,
  currentCategories = [],
  onSubmit,
  onCancel,
  submitLabel,
}: Props) {
  const categories = useCategories();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: defaultValues ?? {
      introduction: "",
      contactDetails: "",
      experience: "",
      serviceCategoryIds: [],
      address: "",
    },
  });

  const handleValidSubmit = async (values: ProfileFormValues) => {
    const body: ProfileInput = {
      introduction: values.introduction,
      contactDetails: values.contactDetails,
      experience: values.experience,
      serviceCategoryIds: values.serviceCategoryIds,
      address: values.address,
      serviceRadiusKm: values.serviceRadiusKm,
    };

    try {
      await onSubmit(body);
    } catch (e) {
      applyServerErrors(e, form.setError);
    }
  };

  if (categories.isPending) {
    return <Loading />;
  }

  if (categories.isError) {
    return (
      <ErrorState
        error={categories.error}
        onRetry={() => categories.refetch()}
        retrying={categories.isFetching}
      />
    );
  }

  // Uma categoria do perfil desativada entretanto já não vem nas ativas, mas continua no perfil:
  // aparece à mesma, para o Prestador a ver e a poder retirar
  const activeIds = new Set(categories.data.items.map((c) => c.serviceCategoryId));
  const categoryOptions = [
    ...categories.data.items.map((c) => ({ value: String(c.serviceCategoryId), label: c.name })),
    ...currentCategories
      .filter((c) => !activeIds.has(c.serviceCategoryId))
      .map((c) => ({ value: String(c.serviceCategoryId), label: `${c.name} (desativada)` })),
  ];

  return (
    <Card>
      <form className={styles.form} noValidate onSubmit={form.handleSubmit(handleValidSubmit)}>
        <TextAreaField
          label="Apresentação"
          required
          placeholder="Ex.: Canalizador com 10 anos de experiência em reparações domésticas."
          maxLength={1000}
          error={form.formState.errors.introduction?.message}
          {...form.register("introduction")}
        />
        <TextAreaField
          label="Contactos"
          required
          placeholder="Ex.: 912 345 678 (dias úteis, 8h–19h)"
          maxLength={500}
          error={form.formState.errors.contactDetails?.message}
          {...form.register("contactDetails")}
        />
        <Controller
          control={form.control}
          name="serviceCategoryIds"
          render={({ field, fieldState }) => (
            <CheckboxGroup
              label="Categorias"
              required
              value={field.value.map(String)}
              onValueChange={(values) => field.onChange(values.map(Number))}
              options={categoryOptions}
              error={fieldState.error?.message}
            />
          )}
        />
        <TextAreaField
          label="Experiência profissional"
          required
          placeholder="Ex.: 10 anos em canalização; reparação de fugas e substituição de torneiras."
          maxLength={2000}
          error={form.formState.errors.experience?.message}
          {...form.register("experience")}
        />
        <div className={styles.location}>
          <AddressField
            required
            error={form.formState.errors.address?.message}
            {...form.register("address")}
          />
          <Controller
            control={form.control}
            name="serviceRadiusKm"
            render={({ field, fieldState }) => (
              <NumberField
                label="Raio de atuação (km)"
                required
                fullWidth
                name={field.name}
                value={field.value ?? null}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                min={1}
                max={100}
                step={1}
                format={{ maximumFractionDigits: 0 }}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
        <FormError message={form.formState.errors.root?.server?.message} />
        <div className={styles.actions}>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {submitLabel}
          </Button>
          {onCancel && (
            <Button variant="text" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
