// Geocodificador simulado (stub do Nominatim) para os testes de sistema.
//
// O backend real é configurado com Nominatim__BaseUrl=http://localhost:<porta>/ e passa a pedir aqui as
// coordenadas das moradas, sem alterar o código do backend. O serviço público limita os pedidos a cerca de
// 1 por segundo, pode bloquear os IP do CI e devolver coordenadas diferentes ao longo do tempo; o stub
// responde sempre o mesmo, no formato jsonv2 do Nominatim.
//
// Execução: node e2e/support/nominatim-stub.ts (Node 24 executa TypeScript sem compilação).
// Porta: variável NOMINATIM_STUB_PORT (por omissão, 8089).

import { createServer, type ServerResponse } from "node:http";
import { LOCALIDADES, MORADA_INDISPONIVEL, type Localidade } from "./geocodificador.ts";

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function procurarPorMorada(morada: string): Localidade | undefined {
  const texto = normalizar(morada);
  return LOCALIDADES.find((l) => texto.includes(l.chave));
}

// Localidade mais próxima das coordenadas (distância simples em graus, suficiente para os testes)
function procurarPorCoordenadas(lat: number, lon: number): Localidade {
  let melhor = LOCALIDADES[0];
  let menor = Number.POSITIVE_INFINITY;
  for (const l of LOCALIDADES) {
    const d = (Number(l.lat) - lat) ** 2 + (Number(l.lon) - lon) ** 2;
    if (d < menor) {
      menor = d;
      melhor = l;
    }
  }
  return melhor;
}

function enviarJson(res: ServerResponse, estado: number, corpo: unknown): void {
  res.writeHead(estado, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(corpo));
}

const porta = Number(process.env.NOMINATIM_STUB_PORT ?? 8089);

const servidor = createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${porta}`);
  console.log(`${new Date().toISOString()} ${req.method} ${url.pathname}${url.search}`);

  if (req.method !== "GET") {
    enviarJson(res, 405, { error: "Method not allowed" });
    return;
  }

  // Verificação de que o stub está a responder (usada pela pipeline antes de arrancar o backend)
  if (url.pathname === "/status") {
    enviarJson(res, 200, { status: 0, message: "OK" });
    return;
  }

  if (url.pathname === "/search") {
    const morada = url.searchParams.get("q") ?? "";
    if (normalizar(morada).includes(MORADA_INDISPONIVEL)) {
      enviarJson(res, 503, { error: "Service unavailable" });
      return;
    }

    const l = procurarPorMorada(morada);
    // Morada desconhecida: o Nominatim responde 200 com uma lista vazia
    enviarJson(
      res,
      200,
      l
        ? [
            {
              lat: l.lat,
              lon: l.lon,
              display_name: `${l.rua} ${l.numero}, ${l.codigoPostal} ${l.cidade}, Portugal`,
            },
          ]
        : [],
    );
    return;
  }

  if (url.pathname === "/reverse") {
    const lat = Number(url.searchParams.get("lat"));
    const lon = Number(url.searchParams.get("lon"));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      enviarJson(res, 400, { error: "Invalid coordinates" });
      return;
    }

    const l = procurarPorCoordenadas(lat, lon);
    enviarJson(res, 200, {
      lat: l.lat,
      lon: l.lon,
      display_name: `${l.rua} ${l.numero}, ${l.codigoPostal} ${l.cidade}, Portugal`,
      address: {
        road: l.rua,
        house_number: l.numero,
        postcode: l.codigoPostal,
        city: l.cidade,
        country: "Portugal",
      },
    });
    return;
  }

  enviarJson(res, 404, { error: "Not found" });
});

servidor.listen(porta, () => {
  console.log(`Geocodificador simulado (Nominatim) em http://localhost:${porta}/`);
});
