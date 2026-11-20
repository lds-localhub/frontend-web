import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { Category, List } from "@/api/types";

// Categorias ativas (E08), usadas nos formulários e nas pesquisas
export const useCategories = () =>
  useQuery({
    queryKey: queryKeys.categories.active,
    queryFn: () => api<List<Category>>("/categories"),
  });
