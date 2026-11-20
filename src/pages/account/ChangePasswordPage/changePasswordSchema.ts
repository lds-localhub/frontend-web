import * as z from "zod";

// O esquema fica fora do ficheiro da página para os testes unitários o poderem importar
// (um ficheiro de componente que exporta outras coisas dá aviso no lint).

const passwordMessage =
  "A palavra-passe tem de ter, no mínimo, 8 caracteres, com pelo menos uma letra e um algarismo.";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Indique a palavra-passe atual."),
    newPassword: z
      .string()
      .min(8, passwordMessage)
      .regex(/\p{L}/u, passwordMessage)
      .regex(/\d/, passwordMessage),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    error: "A confirmação não corresponde à nova palavra-passe.",
    path: ["confirmPassword"],
    when: () => true,
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
