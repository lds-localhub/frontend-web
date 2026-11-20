import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { LocationInput, Me } from "@/api/types";
import { AddressField } from "@/components/ui/AddressField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { PageHeader } from "@/components/ui/PageHeader";
import { toast } from "@/components/ui/Toast";
import { useMe } from "@/hooks/useMe";
import { getErrorMessage, isApiError } from "@/utils/errors";
import { applyServerErrors } from "@/utils/forms";
import styles from "./MyLocationPage.module.css";

const locationSchema = z.object({
  address: z
    .string()
    .trim()
    .min(1, "Indique o endereço.")
    .max(255, "O endereço tem, no máximo, 255 caracteres."),
});

type LocationFormValues = z.infer<typeof locationSchema>;

export function MyLocationPage() {
  const { data: me } = useMe();
  const qc = useQueryClient();

  const form = useForm({
    resolver: zodResolver(locationSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { address: me!.address ?? "" },
  });

  // As distâncias da pesquisa de Prestadores são calculadas a partir da localização registada
  const save = useMutation({
    mutationFn: (body: LocationInput) =>
      api<Me>("/users/me/location", { method: "PUT", body: JSON.stringify(body) }), // E16
    onSuccess: (me) => {
      // O E16 devolve o utilizador já com a nova morada (a estrutura do E04): sem um segundo pedido ao
      // E04, que, se falhasse, trocava a página inteira pelo erro logo a seguir a guardar
      qc.setQueryData(queryKeys.me, me);
      return qc.invalidateQueries({ queryKey: queryKeys.searchProviders.all, refetchType: "all" });
    },
    onError: (e) => {
      if (!isApiError(e) || (e.status !== 400 && e.status !== 401 && !e.errors)) {
        toast(getErrorMessage(e));
      }
    },
  });

  const handleValidSubmit = async (values: LocationFormValues) => {
    const body: LocationInput = { address: values.address };
    try {
      await save.mutateAsync(body);
      form.reset({ address: body.address });
      toast("Localização atualizada.");
    } catch (e) {
      applyServerErrors(e, form.setError);
    }
  };

  const hint = me!.address
    ? "É a sua localização atual. Altere e guarde para a substituir."
    : "Ainda não definiu a sua localização. Indique um endereço e guarde.";

  return (
    <div className={styles.page}>
      <title>A minha localização · LocalHub</title>
      <PageHeader title="A minha localização" />
      <Card>
        <form className={styles.form} noValidate onSubmit={form.handleSubmit(handleValidSubmit)}>
          <AddressField
            label="Endereço"
            required
            hint={hint}
            error={form.formState.errors.address?.message}
            {...form.register("address")}
          />
          <FormError message={form.formState.errors.root?.server?.message} />
          <div>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Guardar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
