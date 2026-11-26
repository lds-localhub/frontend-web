import type { ServiceStatus } from "@/api/types";
import type { FilterOption } from "@/components/ui/FilterSelect";
import { serviceStatusLabels } from "@/utils/labels";

const serviceStatuses: ServiceStatus[] = ["OPEN", "ASSIGNED", "COMPLETED", "CANCELLED"];

// Opções do filtro «Estado» dos serviços do Cliente (o «Todos» é acrescentado pelo FilterSelect)
export const serviceStatusOptions: FilterOption[] = serviceStatuses.map((s) => ({
  value: s,
  label: serviceStatusLabels[s],
}));

// Estado do URL; um valor que não exista é ignorado
export function readServiceStatus(searchParams: URLSearchParams): ServiceStatus | undefined {
  return serviceStatuses.find((s) => s === searchParams.get("status"));
}
