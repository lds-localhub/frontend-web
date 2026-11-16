// ID ou página do URL (caminho ou query param): número inteiro positivo, ou null se faltar ou for inválido
export function parseId(value: string | null | undefined): number | null {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}
