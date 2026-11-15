import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router";
import * as z from "zod";
import { api, setToken } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { LoginInput, LoginResult } from "@/api/types";
import keyIcon from "@/assets/key.svg";
import mailIcon from "@/assets/mail.svg";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { TextField } from "@/components/ui/TextField";
import { useMe } from "@/hooks/useMe";
import { getErrorMessage, isApiError } from "@/utils/errors";
import { applyServerErrors } from "@/utils/forms";
import { homeOf } from "@/utils/homeOf";
import styles from "./LoginPage.module.css";

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || "suporte@localhub.test";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Indique o e-mail.").pipe(z.email("Indique um e-mail válido.")),
  password: z.string().min(1, "Indique a palavra-passe."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Mensagem por cima do formulário: depois do registo (estado da navegação) ou da sessão terminada (URL)
function noticeOf(state: unknown, sessionEnded: boolean): string | undefined {
  if (typeof state === "object" && state !== null && "notice" in state) {
    return typeof state.notice === "string" ? state.notice : undefined;
  }
  return sessionEnded ? "A sua sessão terminou. Inicie sessão novamente." : undefined;
}

export function LoginPage() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [forgotOpen, setForgotOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  // Os erros não seguem a regra das outras ações: aparecem todos no formulário, sem toast
  const login = useMutation({
    mutationFn: (body: LoginInput) =>
      api<LoginResult>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  });

  if (me) {
    return <Navigate to={homeOf(me.role)} replace />;
  }

  const notice = noticeOf(location.state, searchParams.get("sessao") === "terminada");

  const handleValidSubmit = async (values: LoginFormValues) => {
    const body: LoginInput = { email: values.email, password: values.password, client: "WEB" };
    try {
      const result = await login.mutateAsync(body);
      setToken(result.token);
      // O user do início de sessão tem a mesma forma do utilizador autenticado: não é preciso pedi-lo outra vez
      qc.setQueryData(queryKeys.me, result.user);
      const { role, professionalProfileId } = result.user;
      navigate(role === "PROVIDER" && !professionalProfileId ? "/perfil/criar" : homeOf(role), {
        replace: true,
      });
    } catch (e) {
      applyServerErrors(e, form.setError);
      // O 401 aqui são as credenciais erradas, não uma sessão terminada: mostra-se como os outros erros
      if (!isApiError(e) || (!e.errors && e.status !== 400)) {
        form.setError("root.server", { message: getErrorMessage(e) });
      }
    }
  };

  return (
    <div className={styles.page}>
      <title>Iniciar sessão · LocalHub</title>
      <Card>
        <div className={styles.heading}>
          <h1>Iniciar sessão</h1>
          <p className={styles.lead}>Entre com o e-mail e a palavra-passe da sua conta.</p>
        </div>

        {notice && <Callout>{notice}</Callout>}

        <form className={styles.form} noValidate onSubmit={form.handleSubmit(handleValidSubmit)}>
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
            autoComplete="current-password"
            error={form.formState.errors.password?.message}
            {...form.register("password")}
          />

          <div className={styles.forgot}>
            <button
              type="button"
              className={styles.forgotButton}
              aria-expanded={forgotOpen}
              aria-controls="recuperar-acesso"
              onClick={() => setForgotOpen((open) => !open)}
            >
              Esqueci-me da palavra-passe
            </button>
            {forgotOpen && (
              <Callout icon={keyIcon} id="recuperar-acesso">
                Para recuperar o acesso, contacte <strong>{SUPPORT_EMAIL}</strong> a partir do
                endereço de e-mail registado na conta. A administração redefine a palavra-passe e
                responde com uma palavra-passe temporária, que pode alterar depois de iniciar
                sessão.
              </Callout>
            )}
          </div>

          <FormError message={form.formState.errors.root?.server?.message} />

          <div className={styles.actions}>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Entrar
            </Button>
            <Button variant="text" to="/registar">
              Criar conta
            </Button>
          </div>
        </form>

        <Callout icon={mailIcon}>
          Precisa de ajuda com a sua conta? Contacte o suporte: <strong>{SUPPORT_EMAIL}</strong>
        </Callout>
      </Card>
    </div>
  );
}
