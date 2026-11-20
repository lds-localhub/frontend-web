import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router";
import * as z from "zod";
import { House } from "lucide-react";
import { api } from "@/api/client";
import type { RegisterInput } from "@/api/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { TextField } from "@/components/ui/TextField";
import { toast } from "@/components/ui/Toast";
import { useMe } from "@/hooks/useMe";
import { getErrorMessage, isApiError } from "@/utils/errors";
import { applyServerErrors } from "@/utils/forms";
import { homeOf } from "@/utils/homeOf";
import styles from "./RegisterPage.module.css";

const passwordMessage =
  "A palavra-passe tem de ter, no mínimo, 8 caracteres, com pelo menos uma letra e um algarismo.";

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Indique o nome.")
    .max(100, "O nome tem, no máximo, 100 caracteres."),
  email: z
    .string()
    .trim()
    .min(1, "Indique o e-mail.")
    .max(254, "O e-mail tem, no máximo, 254 caracteres.")
    .pipe(z.email("Indique um e-mail válido.")),
  password: z
    .string()
    .min(8, passwordMessage)
    .regex(/\p{L}/u, passwordMessage)
    .regex(/\d/, passwordMessage),
  role: z.enum(["CLIENT", "PROVIDER"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const roleOptions: { value: RegisterFormValues["role"]; label: string }[] = [
  { value: "CLIENT", label: "Cliente" },
  { value: "PROVIDER", label: "Prestador de Serviços" },
];

export function RegisterPage() {
  const { data: me } = useMe();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { name: "", email: "", password: "", role: "CLIENT" as const },
  });

  const register = useMutation({
    mutationFn: (body: RegisterInput) =>
      api<unknown>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
    onError: (e) => {
      if (!isApiError(e) || (e.status !== 400 && e.status !== 401 && !e.errors)) {
        toast(getErrorMessage(e));
      }
    },
  });

  if (me) {
    return <Navigate to={homeOf(me.role)} replace />;
  }

  const handleValidSubmit = async (values: RegisterFormValues) => {
    const body: RegisterInput = {
      name: values.name,
      email: values.email,
      password: values.password,
      role: values.role,
    };
    try {
      await register.mutateAsync(body);
      // O registo não inicia sessão: a mensagem aparece no início de sessão
      navigate("/login", { state: { notice: "Conta criada. Inicie sessão." } });
    } catch (e) {
      applyServerErrors(e, form.setError);
    }
  };

  return (
    <div className={styles.page}>
      <title>Registar conta · LocalHub</title>
      <aside className={styles.panel}>
        <House size={40} strokeWidth={1.75} aria-hidden="true" />
        <div className={styles.panelText}>
          <h2>Junte-se ao LocalHub</h2>
          <p>
            Como Cliente, peça propostas a Prestadores perto de si. Como Prestador, receba pedidos
            na sua zona.
          </p>
        </div>
      </aside>

      <Card>
        <h1>Criar conta</h1>
        <form className={styles.form} noValidate onSubmit={form.handleSubmit(handleValidSubmit)}>
          <TextField
            label="Nome"
            autoComplete="name"
            error={form.formState.errors.name?.message}
            {...form.register("name")}
          />
          <TextField
            label="E-mail"
            type="email"
            autoComplete="email"
            error={form.formState.errors.email?.message}
            {...form.register("email")}
          />
          <TextField
            label="Palavra-passe"
            type="password"
            autoComplete="new-password"
            hint="Mínimo 8 caracteres, com letras e algarismos."
            error={form.formState.errors.password?.message}
            {...form.register("password")}
          />
          <Controller
            control={form.control}
            name="role"
            render={({ field, fieldState }) => (
              <RadioGroup
                label="Tipo de conta"
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                options={roleOptions}
                error={fieldState.error?.message}
              />
            )}
          />

          <FormError message={form.formState.errors.root?.server?.message} />

          <div className={styles.actions}>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Criar conta
            </Button>
            <Button variant="text" to="/login">
              Já tenho conta — Iniciar sessão
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
