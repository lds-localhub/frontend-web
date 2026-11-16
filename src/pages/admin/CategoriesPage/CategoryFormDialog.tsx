import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { Category, CategoryInput } from "@/api/types";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import { toast } from "@/components/ui/Toast";
import { getErrorMessage, isApiError } from "@/utils/errors";
import { applyServerErrors } from "@/utils/forms";
import styles from "./CategoryFormDialog.module.css";

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Indique o nome.")
    .max(60, "O nome tem, no máximo, 60 caracteres."),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

type Props = { category: Category | null; onClose: () => void };

// Mensagem de qualquer erro da ação, exceto os que vão para o formulário (campos e 400) e o 401
function showActionError(e: unknown) {
  if (!isApiError(e) || (e.status !== 400 && e.status !== 401 && !e.errors)) {
    toast(getErrorMessage(e));
  }
}

export function CategoryFormDialog({ category, onClose }: Props) {
  const qc = useQueryClient();

  const form = useForm({
    resolver: zodResolver(categorySchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { name: category?.name ?? "" },
  });

  const refreshCategories = () =>
    qc.invalidateQueries({ queryKey: queryKeys.categories.all, refetchType: "all" });

  const create = useMutation({
    mutationFn: (body: CategoryInput) =>
      api<unknown>("/categories", { method: "POST", body: JSON.stringify(body) }),
    // A categoria nova também conta nas categorias ativas do início da administração
    onSuccess: () =>
      Promise.all([
        refreshCategories(),
        qc.invalidateQueries({ queryKey: queryKeys.admin.all, refetchType: "all" }),
      ]),
    onError: showActionError,
  });

  const rename = useMutation({
    mutationFn: ({ id, body }: { id: number; body: CategoryInput }) =>
      api<unknown>(`/categories/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: refreshCategories,
    onError: showActionError,
  });

  const handleValidSubmit = async (values: CategoryFormValues) => {
    try {
      if (category) {
        await rename.mutateAsync({ id: category.serviceCategoryId, body: values });
        toast("Categoria atualizada.");
      } else {
        await create.mutateAsync(values);
        toast("Categoria criada.");
      }
      onClose();
    } catch (e) {
      applyServerErrors(e, form.setError);
    }
  };

  return (
    <Modal
      open
      onOpenChange={(open) => !open && onClose()}
      title={category ? "Editar categoria" : "Nova categoria"}
    >
      <form className={styles.form} noValidate onSubmit={form.handleSubmit(handleValidSubmit)}>
        <TextField
          label="Nome"
          autoComplete="off"
          hint="1 a 60 caracteres."
          error={form.formState.errors.name?.message}
          {...form.register("name")}
        />

        <FormError message={form.formState.errors.root?.server?.message} />

        <div className={styles.actions}>
          <Button variant="text" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
