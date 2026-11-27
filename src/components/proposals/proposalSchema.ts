import * as z from "zod";

// Limites do valor, das condições e da observação, os mesmos do backend
export const proposalSchema = z.object({
  amount: z
    .number({ error: "Indique o valor." })
    .gt(0, "O valor tem de ser maior que 0.")
    .max(100000, "O valor não pode ser superior a 100 000,00 €.")
    .multipleOf(0.01, "O valor tem, no máximo, duas casas decimais."),
  conditions: z
    .string()
    .trim()
    .min(1, "Indique as condições.")
    .max(1000, "As condições têm, no máximo, 1000 caracteres."),
  obs: z.string().trim().max(500, "A observação tem, no máximo, 500 caracteres."),
});

export type ProposalFormValues = z.infer<typeof proposalSchema>;
