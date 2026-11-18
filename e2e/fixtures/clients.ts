import type { APIRequestContext } from "@playwright/test";
import { failIfNot, registerAndLogin, type TestAccount } from "./accounts.ts";
import { address, type AddressKey } from "./addresses.ts";

// Preparação de Clientes pela API documentada (E01, E02, E16), sem acesso direto à base de dados.

// E01 + E02 + E16: regista um Cliente, inicia sessão e define a sua localização
export async function createClientWithLocation(
  request: APIRequestContext,
  addressKey: AddressKey = "carla",
  prefix = "cliente",
): Promise<TestAccount> {
  const account = await registerAndLogin(request, "CLIENT", prefix);

  const response = await request.put("/api/users/me/location", {
    headers: { Authorization: `Bearer ${account.token}` },
    data: { address: address(addressKey) },
  });
  await failIfNot(response, 200);

  return { ...account, user: { ...account.user, address: address(addressKey) } };
}
