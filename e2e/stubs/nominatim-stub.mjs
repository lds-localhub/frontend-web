// Stub do Nominatim para os testes de sistema (I093).
// Substitui o geocodificador externo: o backend aponta para aqui com Nominatim__BaseUrl.
// Responde no formato do Nominatim (jsonv2) e só conhece as moradas de moradas.json.
//
// Uso: node e2e/stubs/nominatim-stub.mjs   (porta 8089, ou a variável STUB_PORT)

import { createServer } from "node:http";
import { readFileSync } from "node:fs";

const moradas = Object.values(
  JSON.parse(readFileSync(new URL("./moradas.json", import.meta.url), "utf8")),
);
const porta = Number(process.env.STUB_PORT ?? 8089);

// distância máxima (km) para o /reverse aceitar a morada mais próxima
const RAIO_REVERSE_KM = 0.5;

const normalizar = (texto) => texto.trim().toLowerCase();

function distanciaKm(lat1, lon1, lat2, lon2) {
  const rad = (graus) => (graus * Math.PI) / 180;
  const h =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

function pesquisar(q) {
  const encontrada = moradas.find((m) => normalizar(m.morada) === normalizar(q ?? ""));
  return encontrada ? [{ lat: encontrada.lat, lon: encontrada.lon }] : [];
}

function inverter(lat, lon) {
  let maisProxima = null;
  let menorDistancia = Infinity;
  for (const m of moradas) {
    const distancia = distanciaKm(lat, lon, Number(m.lat), Number(m.lon));
    if (distancia < menorDistancia) {
      maisProxima = m;
      menorDistancia = distancia;
    }
  }
  if (!maisProxima || menorDistancia > RAIO_REVERSE_KM) {
    return { error: "Unable to geocode" };
  }
  return { display_name: maisProxima.morada, address: maisProxima.address };
}

const servidor = createServer((pedido, resposta) => {
  const url = new URL(pedido.url, `http://localhost:${porta}`);
  let corpo;

  if (url.pathname === "/search") {
    corpo = pesquisar(url.searchParams.get("q"));
  } else if (url.pathname === "/reverse") {
    corpo = inverter(Number(url.searchParams.get("lat")), Number(url.searchParams.get("lon")));
  } else if (url.pathname === "/status") {
    // usado pela pipeline para saber que o stub já está a responder
    resposta.writeHead(200, { "Content-Type": "text/plain" });
    resposta.end("OK");
    return;
  } else {
    resposta.writeHead(404, { "Content-Type": "application/json" });
    resposta.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  console.log(`${pedido.method} ${url.pathname}${url.search}`);
  resposta.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
  resposta.end(JSON.stringify(corpo));
});

servidor.listen(porta, () => {
  console.log(`Stub do Nominatim em http://localhost:${porta}/`);
});
