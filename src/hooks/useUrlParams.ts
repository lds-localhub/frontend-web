import { useSearchParams } from "react-router";
import { toQueryString } from "@/api/client";

// Filtros e página das listas no URL: lê com a função do ecrã; ao mudar um filtro, volta à página 1
export function useUrlParams<T>(read: (searchParams: URLSearchParams) => T) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Os filtros novos substituem todos os anteriores e a página sai do URL (página 1);
  // os undefined não entram no URL
  const setFilters = (filters: Record<string, string | number | boolean | undefined>) =>
    setSearchParams(toQueryString(filters));

  const setPage = (page: number) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (page === 1) {
        next.delete("page");
      } else {
        next.set("page", String(page));
      }
      return next;
    });

  return { params: read(searchParams), searchParams, setFilters, setPage };
}
