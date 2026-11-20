import table from "../stubs/addresses.json" with { type: "json" };

// Moradas conhecidas pelo stub do Nominatim. Os testes usam-nas em vez de escrever moradas à mão,
// para o backend conseguir sempre convertê-las em coordenadas.
// Distâncias aproximadas a partir do Porto (carla): gaia 2,9 km, matosinhos 7,5 km, maia 9,6 km,
// braga 46,6 km, aveiro 56,7 km.
export type AddressKey = keyof typeof table;

export function address(key: AddressKey): string {
  return table[key].fullAddress;
}

// Morada que o stub do Nominatim não conhece: o backend não a converte em coordenadas e responde 400
export const UNKNOWN_ADDRESS = "Rua Inexistente Fictícia, 1, 0000-000 Nenhures";

// Mensagem do backend (errors.address do 400) quando não converte a morada em coordenadas
export const ADDRESS_NOT_FOUND = "Não foi possível encontrar esta morada. Confirme-a.";
