import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import type { ProposalInput } from "@/api/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { NumberField } from "@/components/ui/NumberField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { applyServerErrors } from "@/utils/forms";
import styles from "./ProposalForm.module.css";
import { type ProposalFormValues, proposalSchema } from "./proposalSchema";

type Props = {
  onSubmit: (body: ProposalInput) => Promise<unknown>;
  onDecline?: () => void; // só nas solicitações diretas: «Recusar solicitação»
  disabled: boolean;
};

// Formulário da proposta (valor, condições e observação); nas solicitações diretas, também a recusa.
// Os erros de campo do backend vão para os campos.
export function ProposalForm({ onSubmit, onDecline, disabled }: Props) {
  const form = useForm({
    resolver: zodResolver(proposalSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { conditions: "", obs: "" },
  });

  const handleValidSubmit = async (values: ProposalFormValues) => {
    const body: ProposalInput = {
      amount: values.amount,
      conditions: values.conditions,
      obs: values.obs || undefined,
    };
    try {
      await onSubmit(body);
    } catch (e) {
      applyServerErrors(e, form.setError);
    }
  };

  const busy = disabled || form.formState.isSubmitting;

  return (
    <Card>
      <form className={styles.form} noValidate onSubmit={form.handleSubmit(handleValidSubmit)}>
        <h2 className={styles.title}>Apresentar proposta</h2>
        <div className={styles.fields}>
          <div className={styles.amount}>
            <Controller
              control={form.control}
              name="amount"
              render={({ field, fieldState }) => (
                <NumberField
                  label="Valor (€)"
                  fullWidth
                  name={field.name}
                  value={field.value ?? null}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  min={0}
                  max={100000}
                  format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                  hint="Obrigatório · maior que 0 e até 100 000,00 €"
                  error={fieldState.error?.message}
                />
              )}
            />
          </div>
          <div className={styles.conditions}>
            <TextAreaField
              label="Condições"
              rows={3}
              hint="Obrigatório · 1 a 1000 caracteres"
              error={form.formState.errors.conditions?.message}
              {...form.register("conditions")}
            />
          </div>
          <div className={styles.obs}>
            <TextField
              label="Observação"
              hint="Opcional · até 500 caracteres"
              error={form.formState.errors.obs?.message}
              {...form.register("obs")}
            />
          </div>
        </div>
        <FormError message={form.formState.errors.root?.server?.message} />
        <div className={styles.actions}>
          <Button type="submit" disabled={busy}>
            Enviar proposta
          </Button>
          {onDecline && (
            <Button variant="danger" onClick={onDecline} disabled={busy}>
              Recusar solicitação
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
