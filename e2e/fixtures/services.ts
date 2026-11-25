import type { APIRequestContext } from "@playwright/test";
import { failIfNot, type TestAccount } from "./accounts.ts";
import { address, type AddressKey } from "./addresses.ts";
import { todayUtc } from "./dates.ts";
import { categoryIds, type TestProvider } from "./providers.ts";

// Preparação de serviços, solicitações diretas, propostas e avaliações pela API documentada
// (E20, E25, E28 a E32), sem acesso direto à base de dados. Tudo fica com a data do dia da execução:
// o backend não aceita disponibilidades no passado e não deixa alterar as datas de criação.

export type ServiceOptions = {
  title?: string;
  // nome de uma categoria ativa dos dados de referência ("Canalização", "Eletricidade")
  categoryName?: string;
  // local de realização (morada conhecida pelo stub do Nominatim)
  addressKey?: AddressKey;
};

export type AssignedServiceOptions = ServiceOptions & {
  amount?: number;
  // modalidade do serviço: com uma solicitação direta ao Prestador (por omissão) ou aberto a propostas
  proposalModel?: "DIRECT_REQUEST" | "PUBLIC";
};

function bearer(account: TestAccount) {
  return { Authorization: `Bearer ${account.token}` };
}

async function createService(
  request: APIRequestContext,
  client: TestAccount,
  proposalModel: "DIRECT_REQUEST" | "PUBLIC",
  professionalProfileIds: number[],
  {
    title = "Serviço dos testes de sistema",
    categoryName = "Canalização",
    addressKey = "carla",
  }: ServiceOptions,
): Promise<number> {
  const [serviceCategoryId] = await categoryIds(request, [categoryName]);
  const response = await request.post("/api/services", {
    headers: bearer(client),
    data: {
      proposalModel,
      serviceCategoryId,
      title,
      description: "Serviço criado pelos testes de sistema.",
      requestedStartDate: todayUtc(),
      requestedEndDate: null,
      location: address(addressKey),
      professionalProfileIds,
    },
  });
  await failIfNot(response, 201);
  const { serviceId } = (await response.json()) as { serviceId: number };
  return serviceId;
}

// E20: serviço com uma solicitação direta a cada um dos perfis indicados; devolve o identificador
export async function createDirectRequestService(
  request: APIRequestContext,
  client: TestAccount,
  professionalProfileIds: number[],
  options: ServiceOptions = {},
): Promise<number> {
  return createService(request, client, "DIRECT_REQUEST", professionalProfileIds, options);
}

// E20: serviço aberto a propostas (trabalho publicado); devolve o identificador
export async function createPublicService(
  request: APIRequestContext,
  client: TestAccount,
  options: ServiceOptions = {},
): Promise<number> {
  return createService(request, client, "PUBLIC", [], options);
}

// E25: o Prestador apresenta uma proposta ao serviço; devolve o identificador da proposta
export async function submitProposal(
  request: APIRequestContext,
  provider: TestAccount,
  serviceId: number,
  amount = 50,
): Promise<number> {
  const response = await request.post(`/api/services/${serviceId}/proposals`, {
    headers: bearer(provider),
    data: { amount, conditions: "Condições do teste." },
  });
  await failIfNot(response, 201);
  const { proposalId } = (await response.json()) as { proposalId: number };
  return proposalId;
}

// E28: o Cliente aceita a proposta; o serviço fica atribuído
export async function acceptProposal(
  request: APIRequestContext,
  client: TestAccount,
  proposalId: number,
): Promise<void> {
  await failIfNot(
    await request.post(`/api/proposals/${proposalId}/accept`, { headers: bearer(client) }),
    200,
  );
}

// E29: o Cliente recusa a proposta; o serviço continua aberto
export async function declineProposal(
  request: APIRequestContext,
  client: TestAccount,
  proposalId: number,
): Promise<void> {
  await failIfNot(
    await request.post(`/api/proposals/${proposalId}/decline`, { headers: bearer(client) }),
    200,
  );
}

// E30: o Cliente ou o Prestador contratado cancela o serviço
export async function cancelService(
  request: APIRequestContext,
  account: TestAccount,
  serviceId: number,
): Promise<void> {
  await failIfNot(
    await request.post(`/api/services/${serviceId}/cancel`, { headers: bearer(account) }),
    200,
  );
}

// E31: o Cliente marca o serviço atribuído como realizado
export async function completeService(
  request: APIRequestContext,
  client: TestAccount,
  serviceId: number,
): Promise<void> {
  await failIfNot(
    await request.post(`/api/services/${serviceId}/complete`, { headers: bearer(client) }),
    200,
  );
}

// E32: o Cliente avalia o serviço realizado (1 a 5 estrelas)
export async function reviewService(
  request: APIRequestContext,
  client: TestAccount,
  serviceId: number,
  rating: number,
): Promise<void> {
  await failIfNot(
    await request.post(`/api/services/${serviceId}/review`, {
      headers: bearer(client),
      data: { rating },
    }),
    201,
  );
}

// E20 + E25 + E28: serviço com uma solicitação direta ao Prestador (ou aberto a propostas), em que o
// Prestador apresenta uma proposta, aceite pelo Cliente: o serviço fica atribuído
export async function createAssignedService(
  request: APIRequestContext,
  client: TestAccount,
  provider: TestProvider,
  { amount = 50, proposalModel = "DIRECT_REQUEST", ...options }: AssignedServiceOptions = {},
): Promise<{ serviceId: number; proposalId: number }> {
  const serviceId =
    proposalModel === "PUBLIC"
      ? await createPublicService(request, client, options)
      : await createDirectRequestService(
          request,
          client,
          [provider.professionalProfileId],
          options,
        );
  const proposalId = await submitProposal(request, provider, serviceId, amount);
  await acceptProposal(request, client, proposalId);
  return { serviceId, proposalId };
}
