import { Search } from "lucide-react";
import { useState, type SubmitEvent } from "react";
import type { SearchServicesParams } from "@/api/types";
import { CategorySelect } from "@/components/categories/CategorySelect";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import styles from "./SearchServicesForm.module.css";

export type SearchServicesFilters = {
  serviceCategoryId: number | undefined;
  withinServiceRadius: boolean | undefined;
};

type Props = {
  initial: SearchServicesParams;
  fieldErrors: Record<string, string[]> | undefined; // erros por campo do 400 da pesquisa
  onSearch: (filters: SearchServicesFilters) => void;
};

// Filtros da pesquisa de serviços (categoria opcional e só dentro do raio), aplicados só em
// «Pesquisar». Quem o usa recria-o com uma key quando o URL muda, para o rascunho voltar aos valores
// aplicados.
export function SearchServicesForm({ initial, fieldErrors, onSearch }: Props) {
  const [serviceCategoryId, setServiceCategoryId] = useState(initial.serviceCategoryId);
  const [withinServiceRadius, setWithinServiceRadius] = useState(!!initial.withinServiceRadius);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Sem o interruptor ligado, o filtro não vai para o URL
    onSearch({ serviceCategoryId, withinServiceRadius: withinServiceRadius || undefined });
  };

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <div className={styles.category}>
        <CategorySelect
          value={serviceCategoryId}
          onValueChange={setServiceCategoryId}
          allowAll
          error={fieldErrors?.serviceCategoryId?.[0]}
        />
      </div>
      <div className={styles.radius}>
        <Switch
          label="Só dentro do meu raio"
          checked={withinServiceRadius}
          onCheckedChange={setWithinServiceRadius}
        />
      </div>
      <div className={styles.submit}>
        <Button type="submit">
          <Search size={16} />
          Pesquisar
        </Button>
      </div>
    </form>
  );
}
