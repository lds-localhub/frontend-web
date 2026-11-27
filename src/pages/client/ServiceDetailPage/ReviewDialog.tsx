import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { ReviewInput } from "@/api/types";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { Modal } from "@/components/ui/Modal";
import { StarRatingField } from "@/components/ui/StarRatingField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { toast } from "@/components/ui/Toast";
import { getErrorMessage, isApiError } from "@/utils/errors";
import { applyServerErrors } from "@/utils/forms";
import { type ReviewFormValues, ratingMeanings, reviewSchema } from "./reviewSchema";
import styles from "./ReviewDialog.module.css";

type Props = {
  serviceId: number;
  providerName: string;
  onClose: () => void;
};

// Avaliação do serviço realizado. Não pede confirmação: submeter já é a decisão
export function ReviewDialog({ serviceId, providerName, onClose }: Props) {
  const qc = useQueryClient();

  const form = useForm({
    resolver: zodResolver(reviewSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { comment: "" },
  });

  // O serviço passa a avaliado; a média, o número e as avaliações do Prestador mudam
  const refresh = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.services.all, refetchType: "all" }),
      qc.invalidateQueries({ queryKey: queryKeys.profiles.all, refetchType: "all" }),
      qc.invalidateQueries({ queryKey: queryKeys.searchProviders.all, refetchType: "all" }),
    ]);

  const review = useMutation({
    mutationFn: (body: ReviewInput) =>
      api<unknown>(`/services/${serviceId}/review`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: refresh,
    onError: (e) => {
      // Os erros de campo e o 400 são mostrados no formulário
      if (!isApiError(e) || (e.status !== 400 && e.status !== 401 && !e.errors)) {
        toast(getErrorMessage(e));
      }
      // Estado diferente no servidor (ex.: o serviço já foi avaliado): fecha e atualiza o detalhe
      if (isApiError(e) && e.status === 409 && !e.errors) {
        onClose();
        return refresh();
      }
    },
  });

  const handleValidSubmit = async (values: ReviewFormValues) => {
    try {
      await review.mutateAsync({ rating: values.rating, comment: values.comment || undefined });
      toast("Avaliação registada.");
      onClose();
    } catch (e) {
      applyServerErrors(e, form.setError);
    }
  };

  return (
    <Modal
      open
      onOpenChange={(open) => !open && !review.isPending && onClose()}
      title="Avaliar serviço"
    >
      <form className={styles.form} noValidate onSubmit={form.handleSubmit(handleValidSubmit)}>
        <p className={styles.intro}>
          Como correu o serviço com <strong>{providerName}</strong>? A avaliação fica no perfil do
          Prestador e não pode ser alterada depois.
        </p>

        <Controller
          control={form.control}
          name="rating"
          render={({ field, fieldState }) => (
            <StarRatingField
              label="Classificação"
              value={field.value}
              onValueChange={field.onChange}
              meanings={ratingMeanings}
              error={fieldState.error?.message}
            />
          )}
        />

        <TextAreaField
          label="Comentário"
          hint="Opcional, até 500 caracteres."
          error={form.formState.errors.comment?.message}
          {...form.register("comment")}
        />

        <FormError message={form.formState.errors.root?.server?.message} />

        <div className={styles.actions}>
          <Button variant="text" onClick={onClose} disabled={review.isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Submeter avaliação
          </Button>
        </div>
      </form>
    </Modal>
  );
}
