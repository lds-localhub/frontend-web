import * as z from "zod";

// Prestador selecionado: com o nome (lista dos selecionados) e as categorias (limitam a categoria do
// serviço às que todos os selecionados têm, RF-F009-03 regra 7). Só os IDs vão para o E20.
const selectedProvider = z.object({
  professionalProfileId: z.number(),
  name: z.string(),
  serviceCategoryIds: z.array(z.number()),
});

// Data atual em UTC, como no backend (secção 4.3 da Documentação da API)
const todayUtc = () => new Date().toISOString().slice(0, 10);

// Criar serviço (E20): regras de campo da Documentação da API. As datas AAAA-MM-DD comparam-se como texto.
export const createServiceSchema = z
  .object({
    proposalModel: z.enum(["DIRECT_REQUEST", "PUBLIC"]),
    serviceCategoryId: z.number({ error: "Escolha a categoria." }),
    title: z
      .string()
      .trim()
      .min(1, "Indique o título.")
      .max(100, "O título tem, no máximo, 100 caracteres."),
    description: z
      .string()
      .trim()
      .min(1, "Indique a descrição.")
      .max(1000, "A descrição tem, no máximo, 1000 caracteres."),
    location: z
      .string()
      .trim()
      .min(1, "Indique o local de realização.")
      .max(255, "O local tem, no máximo, 255 caracteres."),
    dateMode: z.enum(["single", "range"]), // não é enviado: decide se vai o requestedEndDate
    requestedStartDate: z.string().min(1, "Indique a data."),
    requestedEndDate: z.string(),
    providers: z.array(selectedProvider),
  })
  .superRefine(
    (v, ctx) => {
      if (v.proposalModel === "DIRECT_REQUEST" && v.providers.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["providers"],
          message: "Selecione pelo menos um Prestador.",
        });
      }
      if (v.requestedStartDate && v.requestedStartDate < todayUtc()) {
        ctx.addIssue({
          code: "custom",
          path: ["requestedStartDate"],
          message: "A data não pode ser anterior a hoje.",
        });
      }
      if (v.dateMode === "range") {
        if (!v.requestedEndDate) {
          ctx.addIssue({
            code: "custom",
            path: ["requestedEndDate"],
            message: "Indique a data final.",
          });
        } else if (v.requestedStartDate && v.requestedEndDate < v.requestedStartDate) {
          ctx.addIssue({
            code: "custom",
            path: ["requestedEndDate"],
            message: "A data final não pode ser anterior à data inicial.",
          });
        }
      }
    },
    { when: () => true }, // corre sempre, mesmo com outros campos inválidos (11.7)
  );

export type CreateServiceFormValues = z.infer<typeof createServiceSchema>;
export type SelectedProvider = z.infer<typeof selectedProvider>;
