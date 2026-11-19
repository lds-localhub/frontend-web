import type { APIRequestContext } from "@playwright/test";
import { registerAndLogin, type TestAccount } from "./accounts.ts";
import { createProviderWithProfile, type TestProvider } from "./providers.ts";
import {
  cancelService,
  completeService,
  createAssignedService,
  reviewService,
} from "./services.ts";

// Contas com alertas de conduta para a gestão de contas (TS-WEB-03), preparadas pela API documentada
// (E01, E02, E12, E20, E25, E28, E30, E31, E32). Os nomes começam por «A TS03» porque a lista de contas
// (E05) vem ordenada por nome e paginada: assim ficam na primeira página, à frente das contas
// «Cliente …» e «Prestador …» criadas pelos outros testes.

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
    const { serviceId } = await createAssignedService(request, client, provider, {
      title: `Serviço ${i}`,
    });
    if (i <= 2) {
      await cancelService(request, client, serviceId);
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

  for (const [i, rating] of [2, 2, 1].entries()) {
    const { serviceId } = await createAssignedService(request, client, provider, {
      title: `Serviço ${i + 1}`,
    });
    await completeService(request, client, serviceId);
    await reviewService(request, client, serviceId, rating);
  }
  return provider;
}
