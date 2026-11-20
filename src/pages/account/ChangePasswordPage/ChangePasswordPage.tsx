import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { api } from "@/api/client";
import type { ChangePasswordInput } from "@/api/types";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { TextField } from "@/components/ui/TextField";
import { toast } from "@/components/ui/Toast";
import { useMe } from "@/hooks/useMe";
import { getErrorMessage, isApiError } from "@/utils/errors";
import { applyServerErrors } from "@/utils/forms";
import { homeOf } from "@/utils/homeOf";
import styles from "./ChangePasswordPage.module.css";
import { changePasswordSchema, type ChangePasswordFormValues } from "./changePasswordSchema";

export function ChangePasswordPage() {
  const { data: me } = useMe();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const change = useMutation({
    mutationFn: (body: ChangePasswordInput) =>
      api<void>("/users/me/password", { method: "PUT", body: JSON.stringify(body) }),
    onError: (e) => {
      if (!isApiError(e) || (e.status !== 400 && e.status !== 401 && !e.errors)) {
        toast(getErrorMessage(e));
      }
    },
  });

  // Sem página anterior na aplicação (link aberto diretamente), voltar atrás sairia do LocalHub
  const handleBackClick = () =>
    location.key === "default" ? navigate(homeOf(me!.role)) : navigate(-1);

  const handleValidSubmit = async (values: ChangePasswordFormValues) => {
    const body: ChangePasswordInput = {
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    };
    try {
      await change.mutateAsync(body);
      form.reset();
      toast("Palavra-passe alterada.");
    } catch (e) {
      applyServerErrors(e, form.setError);
    }
  };

  return (
    <div className={styles.page}>
      <title>Alterar palavra-passe · LocalHub</title>
      <BackLink onClick={handleBackClick}>Voltar</BackLink>
      <Card>
        <div className={styles.heading}>
          <h1>Alterar palavra-passe</h1>
          <p className={styles.lead}>
            Indique a palavra-passe atual e a nova palavra-passe. As sessões iniciadas noutros
            dispositivos são terminadas; esta sessão mantém-se.
          </p>
        </div>
        <form className={styles.form} noValidate onSubmit={form.handleSubmit(handleValidSubmit)}>
          <TextField
            label="Palavra-passe atual"
            type="password"
            autoComplete="current-password"
            error={form.formState.errors.currentPassword?.message}
            {...form.register("currentPassword")}
          />
          <TextField
            label="Nova palavra-passe"
            type="password"
            autoComplete="new-password"
            hint="Mínimo de 8 caracteres, com pelo menos uma letra e um algarismo."
            error={form.formState.errors.newPassword?.message}
            {...form.register("newPassword")}
          />
          <TextField
            label="Confirmar nova palavra-passe"
            type="password"
            autoComplete="new-password"
            error={form.formState.errors.confirmPassword?.message}
            {...form.register("confirmPassword")}
          />

          <FormError message={form.formState.errors.root?.server?.message} />

          <div className={styles.actions}>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Guardar
            </Button>
            <Button variant="text" onClick={handleBackClick}>
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
