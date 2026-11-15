// Stub do Nominatim para os testes de sistema (I093).
// Substitui o geocodificador externo: o backend aponta para aqui com Nominatim__BaseUrl.
// Responde no formato do Nominatim (jsonv2) e só conhece as moradas de addresses.json.
//
// Uso: node e2e/stubs/nominatim-stub.mjs   (porta 8089, ou a variável STUB_PORT)

import { createServer } from "node:http";
import { readFileSync } from "node:fs";

const addresses = Object.values(
  JSON.parse(readFileSync(new URL("./addresses.json", import.meta.url), "utf8")),
);
const port = Number(process.env.STUB_PORT ?? 8089);

// distância máxima (km) para o /reverse aceitar a morada mais próxima
const REVERSE_MAX_DISTANCE_KM = 0.5;

const normalize = (text) => text.trim().toLowerCase();

// Morada como o backend a compõe a partir da resposta do /reverse ("{road} {house_number}, {postcode} {city}").
// O /search aceita esta forma e a fullAddress, para "posição do dispositivo → guardar morada" funcionar.
function composedAddress({ road, house_number: number, postcode, city }) {
  const street = number ? `${road} ${number}` : road;
  const place = [postcode, city].filter(Boolean).join(" ");
  return place ? `${street}, ${place}` : street;
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const rad = (degrees) => (degrees * Math.PI) / 180;
  const h =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

function search(query) {
  const wanted = normalize(query ?? "");
  const found = addresses.find(
    (a) => normalize(a.fullAddress) === wanted || normalize(composedAddress(a.address)) === wanted,
  );
  return found ? [{ lat: found.lat, lon: found.lon }] : [];
}

function reverse(lat, lon) {
  let nearest = null;
  let nearestDistance = Infinity;
  for (const a of addresses) {
    const distance = distanceKm(lat, lon, Number(a.lat), Number(a.lon));
    if (distance < nearestDistance) {
      nearest = a;
      nearestDistance = distance;
    }
  }
  if (!nearest || nearestDistance > REVERSE_MAX_DISTANCE_KM) {
    return { error: "Unable to geocode" };
  }
  return { display_name: nearest.fullAddress, address: nearest.address };
}

const server = createServer((request, response) => {
  const url = new URL(request.url, `http://localhost:${port}`);
  let body;

  if (url.pathname === "/search") {
    body = search(url.searchParams.get("q"));
  } else if (url.pathname === "/reverse") {
    body = reverse(Number(url.searchParams.get("lat")), Number(url.searchParams.get("lon")));
  } else if (url.pathname === "/status") {
    // usado pela pipeline para saber que o stub já está a responder
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("OK");
    return;
  } else {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  console.log(`${request.method} ${url.pathname}${url.search}`);
  response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
});

server.listen(port, () => {
  console.log(`Stub do Nominatim em http://localhost:${port}/`);
});
