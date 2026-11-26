import * as z from "zod";

// Regras do E32: classificação inteira de 1 a 5, obrigatória; comentário opcional, até 500 caracteres
export const reviewSchema = z.object({
  rating: z
    .number({ error: "Escolha a classificação." })
    .int("Escolha a classificação.")
    .min(1, "Escolha a classificação.")
    .max(5, "Escolha a classificação."),
  comment: z.string().trim().max(500, "O comentário tem, no máximo, 500 caracteres."),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;

// Significado de cada classificação, ao lado das estrelas
export const ratingMeanings: Record<number, string> = {
  1: "Muito insatisfeito",
  2: "Insatisfeito",
  3: "Razoável",
  4: "Satisfeito",
  5: "Muito satisfeito",
};
