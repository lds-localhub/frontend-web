import * as z from "zod";

// Prestador selecionado: o nome serve para a lista dos selecionados e as categorias limitam a
// categoria do serviço às que todos têm. Ao criar o serviço, só se enviam os IDs.
const selectedProvider = z.object({
  professionalProfileId: z.number(),
  name: z.string(),
  serviceCategoryIds: z.array(z.number()),
});

// Data de hoje em UTC, a mesma referência que o backend usa para recusar datas no passado
const todayUtc = () => new Date().toISOString().slice(0, 10);

// Regras dos campos do serviço, as mesmas que o backend aplica. As datas AAAA-MM-DD comparam-se
// como texto, porque nesse formato a ordem alfabética é a ordem cronológica.
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
      // Sem categoria ou local não há pesquisa de Prestadores, por isso ainda não se pede seleção
      if (
        v.proposalModel === "DIRECT_REQUEST" &&
        v.providers.length === 0 &&
        v.location !== "" &&
        v.serviceCategoryId !== undefined
      ) {
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
    {
      // Corre mesmo com outros campos inválidos (ex.: sem categoria), para mostrar todos os erros
      // de uma vez; os valores vêm sempre dos defaultValues, por isso os campos usados aqui existem
      when: () => true,
    },
  );

export type CreateServiceFormValues = z.infer<typeof createServiceSchema>;
export type SelectedProvider = z.infer<typeof selectedProvider>;
