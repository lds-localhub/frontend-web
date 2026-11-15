// Dados do geocodificador simulado (nominatim-stub.ts), partilhados com os testes de sistema.

export interface Localidade {
  // Texto procurado na morada, sem acentos e em minúsculas
  chave: string;
  lat: string;
  lon: string;
  // Morada devolvida pela pesquisa inversa
  rua: string;
  numero: string;
  codigoPostal: string;
  cidade: string;
}

// Coordenadas fixas, aproximadas ao centro das localidades (dados fictícios, RNF-20).
// A primeira localidade que aparecer na morada é a usada.
export const LOCALIDADES: readonly Localidade[] = [
  {
    chave: "porto",
    lat: "41.1496",
    lon: "-8.6109",
    rua: "Avenida dos Aliados",
    numero: "1",
    codigoPostal: "4000-064",
    cidade: "Porto",
  },
  {
    chave: "felgueiras",
    lat: "41.3647",
    lon: "-8.1979",
    rua: "Rua Dr. Leonardo Coimbra",
    numero: "10",
    codigoPostal: "4610-105",
    cidade: "Felgueiras",
  },
  {
    chave: "braga",
    lat: "41.5454",
    lon: "-8.4265",
    rua: "Avenida da Liberdade",
    numero: "1",
    codigoPostal: "4710-251",
    cidade: "Braga",
  },
  {
    chave: "lisboa",
    lat: "38.7223",
    lon: "-9.1393",
    rua: "Avenida da Liberdade",
    numero: "1",
    codigoPostal: "1250-096",
    cidade: "Lisboa",
  },
];

// Uma morada com este texto simula o Nominatim indisponível (HTTP 503)
export const MORADA_INDISPONIVEL = "geocodificador indisponivel";
