import { Search } from "lucide-react";
import { useState, type SubmitEvent } from "react";
import { Link } from "react-router";
import type { SearchProvidersParams } from "@/api/types";
import { CategorySelect } from "@/components/categories/CategorySelect";
import { AddressField } from "@/components/ui/AddressField";
import { Button } from "@/components/ui/Button";
import { useMe } from "@/hooks/useMe";
import { ReferenceLocationSelect, type ReferenceLocation } from "./ReferenceLocationSelect";
import styles from "./SearchProvidersForm.module.css";

export type SearchProvidersFilters = { serviceCategoryId: number; address: string | undefined };

type Props = {
  initial: SearchProvidersParams | null;
  hasRegisteredLocation: boolean;
  fieldErrors: Record<string, string[]> | undefined; // erros por campo do 400 da pesquisa
  onSearch: (filters: SearchProvidersFilters) => void;
};

type Draft = {
  serviceCategoryId: number | undefined;
  location: ReferenceLocation;
  address: string;
};

// Erros dos filtros em falta, verificados aqui porque sem eles a pesquisa não chega a ser feita
const categoryRequired = "Escolha uma categoria.";
const addressRequired = "Indique um endereço para pesquisar.";

// Filtros da pesquisa de Prestadores (categoria e localização de referência), aplicados só em
// «Pesquisar». Sem categoria, ou sem localização de referência, a pesquisa não é feita e o erro
// aparece junto ao campo. Quem o usa recria-o com uma key quando o URL
// muda, para o rascunho voltar aos valores aplicados.
export function SearchProvidersForm({
  initial,
  hasRegisteredLocation,
  fieldErrors,
  onSearch,
}: Props) {
  const { data: me } = useMe();
  const [draft, setDraft] = useState<Draft>({
    serviceCategoryId: initial?.serviceCategoryId,
    location: hasRegisteredLocation && !initial?.address ? "registered" : "other",
    address: initial?.address ?? "",
  });
  const [errors, setErrors] = useState<{ serviceCategoryId?: string; address?: string }>({});

  const isClient = me?.role === "CLIENT";
  const usesRegistered = hasRegisteredLocation && draft.location === "registered";

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const typedAddress = draft.address.trim() || undefined;
    const address = usesRegistered ? undefined : typedAddress;
    const next = {
      serviceCategoryId: draft.serviceCategoryId === undefined ? categoryRequired : undefined,
      address: !usesRegistered && !address ? addressRequired : undefined,
    };
    setErrors(next);
    if (draft.serviceCategoryId === undefined || next.address) {
      return;
    }
    onSearch({ serviceCategoryId: draft.serviceCategoryId, address });
  };

  const addressField = (
    <AddressField
      label={hasRegisteredLocation ? "Outro endereço" : "Localização de referência (obrigatória)"}
      placeholder="Ex.: Rua de Santa Catarina 100, Porto"
      value={draft.address}
      onChange={(e) => {
        setDraft((prev) => ({ ...prev, address: e.target.value }));
        setErrors((prev) => ({ ...prev, address: undefined }));
      }}
      error={errors.address ?? fieldErrors?.address?.[0]}
    />
  );

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <div className={styles.fields}>
        <CategorySelect
          value={draft.serviceCategoryId}
          onValueChange={(serviceCategoryId) => {
            setDraft((prev) => ({ ...prev, serviceCategoryId }));
            setErrors((prev) => ({ ...prev, serviceCategoryId: undefined }));
          }}
          error={errors.serviceCategoryId ?? fieldErrors?.serviceCategoryId?.[0]}
        />
        {hasRegisteredLocation ? (
          <ReferenceLocationSelect
            value={draft.location}
            registeredAddress={me?.address ?? ""}
            onChange={(location) => {
              setDraft((prev) => ({ ...prev, location }));
              setErrors((prev) => ({ ...prev, address: undefined }));
            }}
          />
        ) : (
          addressField
        )}
        <div className={styles.submit}>
          <Button type="submit">
            <Search size={16} />
            Pesquisar
          </Button>
        </div>
      </div>
      {hasRegisteredLocation && draft.location === "other" && (
        <div className={styles.other}>{addressField}</div>
      )}
      {isClient && !hasRegisteredLocation && (
        <p className={styles.setLocation}>
          <Link to="/conta/localizacao">Definir a minha localização</Link>
        </p>
      )}
    </form>
  );
}
