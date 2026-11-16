import type { APIRequestContext } from "@playwright/test";
import { failIfNot, registerAndLogin, type TestAccount } from "./accounts.ts";
import { address } from "./addresses.ts";
import { categoryIds, createProviderWithProfile, type TestProvider } from "./providers.ts";

// Contas com alertas de conduta para a gestão de contas (TS-WEB-03), preparadas pela API documentada
// (E01, E02, E12, E20, E25, E28, E30, E31, E32). Os nomes começam por «A TS03» porque a lista de contas
// (E05) vem ordenada por nome e paginada: assim ficam na primeira página, à frente das contas
// «Cliente …» e «Prestador …» criadas pelos outros testes.

// Data de hoje em UTC (AAAA-MM-DD), como a data atual do backend
function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

// E20 + E25 + E28: serviço com uma solicitação direta ao Prestador, que apresenta uma proposta,
// aceite pelo Cliente: o serviço fica atribuído. Devolve o identificador do serviço.
async function createAssignedService(
  request: APIRequestContext,
  client: TestAccount,
  provider: TestProvider,
  title: string,
): Promise<number> {
  const [serviceCategoryId] = await categoryIds(request, ["Canalização"]);
  const asClient = { Authorization: `Bearer ${client.token}` };

  const created = await request.post("/api/services", {
    headers: asClient,
    data: {
      proposalModel: "DIRECT_REQUEST",
      serviceCategoryId,
      title,
      description: "Serviço criado pelos testes de sistema.",
      requestedStartDate: todayUtc(),
      requestedEndDate: null,
      location: address("carla"),
      professionalProfileIds: [provider.professionalProfileId],
    },
  });
  await failIfNot(created, 201);
  const { serviceId } = (await created.json()) as { serviceId: number };

  const proposed = await request.post(`/api/services/${serviceId}/proposals`, {
    headers: { Authorization: `Bearer ${provider.token}` },
    data: { amount: 50, conditions: "Condições do teste." },
  });
  await failIfNot(proposed, 201);
  const { proposalId } = (await proposed.json()) as { proposalId: number };

  await failIfNot(
    await request.post(`/api/proposals/${proposalId}/accept`, { headers: asClient }),
    200,
  );
  return serviceId;
}

// Cliente com o alerta de cancelamentos: 3 serviços chegam a atribuído e o Cliente cancela 2 (E30).
// O alerta aparece com pelo menos 3 serviços atribuídos e metade ou mais cancelados pelo Cliente:
// «Cancelamentos de serviços atribuídos: 2 de 3 (67%)».
export async function createClientWithCancellationAlert(
  request: APIRequestContext,
  name: string,
): Promise<TestAccount> {
  const provider = await createProviderWithProfile(request);
  const client = await registerAndLogin(request, "CLIENT", "ts03.cliente", name);

  for (let i = 1; i <= 3; i++) {
    const serviceId = await createAssignedService(request, client, provider, `Serviço ${i}`);
    if (i <= 2) {
      await failIfNot(
        await request.post(`/api/services/${serviceId}/cancel`, {
          headers: { Authorization: `Bearer ${client.token}` },
        }),
        200,
      );
    }
  }
  return client;
}

// Prestador com o alerta de classificação média baixa: 3 serviços realizados (E31) e avaliados
// com 2, 2 e 1 estrelas (E32). O alerta aparece com média de 2,0 ou menos e pelo menos 3 avaliações:
// «Classificação média baixa: 1,7 (3 avaliações)».
export async function createProviderWithLowRatingAlert(
  request: APIRequestContext,
  name: string,
): Promise<TestProvider> {
  const provider = await createProviderWithProfile(request, { name });
  const client = await registerAndLogin(request, "CLIENT", "ts03.avaliador");
  const asClient = { Authorization: `Bearer ${client.token}` };

  for (const [i, rating] of [2, 2, 1].entries()) {
    const serviceId = await createAssignedService(request, client, provider, `Serviço ${i + 1}`);
    await failIfNot(
      await request.post(`/api/services/${serviceId}/complete`, { headers: asClient }),
      200,
    );
    await failIfNot(
      await request.post(`/api/services/${serviceId}/review`, {
        headers: asClient,
        data: { rating },
      }),
      201,
    );
  }
  return provider;
}
