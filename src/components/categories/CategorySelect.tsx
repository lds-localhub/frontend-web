import { Select } from "@/components/ui/Select";
import { useCategories } from "@/hooks/useCategories";

type Props = {
  value: number | undefined;
  onValueChange: (value: number | undefined) => void;
  allowAll?: boolean; // primeira opção «Todas» (sem categoria)
  onlyIds?: number[]; // só estas categorias ativas
  hint?: string;
  error?: string;
};

const allValue = "all";

// Seletor das categorias ativas (E08), com «Todas» ou limitado a algumas
export function CategorySelect({ value, onValueChange, allowAll, onlyIds, hint, error }: Props) {
  const categories = useCategories();

  const active = (categories.data?.items ?? []).filter(
    (c) => !onlyIds || onlyIds.includes(c.serviceCategoryId),
  );
  // Um ID que não está na lista (inexistente, inativo ou fora do onlyIds, ex.: escrito no URL)
  // fica como sem categoria, para o seletor não mostrar um valor que não pode ser escolhido
  const known = value !== undefined && active.some((c) => c.serviceCategoryId === value);
  const items = [
    ...(allowAll ? [{ value: allValue, label: "Todas" }] : []),
    ...active.map((c) => ({ value: String(c.serviceCategoryId), label: c.name })),
  ];

  return (
    <Select
      label="Categoria"
      items={items}
      value={known ? String(value) : allowAll ? allValue : undefined}
      onValueChange={(next) => onValueChange(next === allValue ? undefined : Number(next))}
      placeholder={categories.isPending ? "A carregar…" : "Escolha uma categoria"}
      hint={hint}
      error={error ?? (categories.isError ? "Não foi possível carregar as categorias." : undefined)}
      disabled={categories.isPending}
    />
  );
}
