import table from "../stubs/addresses.json" with { type: "json" };

// Moradas conhecidas pelo stub do Nominatim. Os testes usam-nas em vez de escrever moradas à mão,
// para o backend conseguir sempre convertê-las em coordenadas.
// Distâncias aproximadas a partir do Porto (carla): gaia 2,9 km, matosinhos 7,5 km, maia 9,6 km,
// braga 46,6 km, aveiro 56,7 km.
export type AddressKey = keyof typeof table;

export function address(key: AddressKey): string {
  return table[key].fullAddress;
}
