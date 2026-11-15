import type { APIRequestContext } from "@playwright/test";
import { failIfNot, registerAndLogin, type TestAccount } from "./accounts.ts";
import { address, type AddressKey } from "./addresses.ts";

// Preparação de Prestadores pela API documentada (E08, E12), sem acesso direto à base de dados.
// Regra para os testes de pesquisa: a BD não é reposta entre testes nem entre novas tentativas, por isso
// há sempre outros Prestadores na mesma zona (o Hugo dos dados de referência e os de outros testes).
// Um teste procura o seu Prestador pelo nome (user.name, único) e nunca depende do total de resultados.

export interface ProviderOptions {
  addressKey?: AddressKey;
  serviceRadiusKm?: number;
  // nomes das categorias ativas dos dados de referência ("Canalização", "Eletricidade")
  categoryNames?: string[];
}

export interface TestProvider extends TestAccount {
  professionalProfileId: number;
}

// E08: devolve os identificadores das categorias ativas com os nomes indicados
export async function categoryIds(request: APIRequestContext, names: string[]): Promise<number[]> {
  const response = await request.get("/api/categories");
  await failIfNot(response, 200);
  const { items } = (await response.json()) as {
    items: { serviceCategoryId: number; name: string }[];
  };
  return names.map((name) => {
    const category = items.find((c) => c.name === name);
    if (!category) {
      throw new Error(`Categoria ativa inexistente: ${name}`);
    }
    return category.serviceCategoryId;
  });
}

// E01 + E02 + E12: regista um Prestador, inicia sessão e cria o perfil profissional
export async function createProviderWithProfile(
  request: APIRequestContext,
  {
    addressKey = "maia",
    serviceRadiusKm = 25,
    categoryNames = ["Canalização"],
  }: ProviderOptions = {},
): Promise<TestProvider> {
  const account = await registerAndLogin(request, "PROVIDER");

  const response = await request.post("/api/profiles", {
    headers: { Authorization: `Bearer ${account.token}` },
    data: {
      introduction: "Prestador criado pelos testes de sistema.",
      contactDetails: "Telefone 220 000 000",
      experience: "Experiência fictícia para os testes.",
      serviceCategoryIds: await categoryIds(request, categoryNames),
      address: address(addressKey),
      serviceRadiusKm,
    },
  });
  await failIfNot(response, 201);
  const { professionalProfileId } = (await response.json()) as { professionalProfileId: number };

  return { ...account, professionalProfileId };
}
