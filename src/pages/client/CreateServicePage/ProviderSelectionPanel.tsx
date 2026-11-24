import { Info, Search, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { ProviderSearchItem } from "@/api/types";
import { ProviderProfile } from "@/components/profiles/ProviderProfile";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loading } from "@/components/ui/Loading";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { TextField } from "@/components/ui/TextField";
import { useSearchProviders } from "@/hooks/useSearchProviders";
import type { SelectedProvider } from "./createServiceSchema";
import { ProviderOption } from "./ProviderOption";
import { useDebouncedValue } from "./useDebouncedValue";
import styles from "./ProviderSelectionPanel.module.css";

type Props = {
  categoryId: number | undefined;
  location: string;
  value: SelectedProvider[];
  onChange: (value: SelectedProvider[]) => void;
  error?: string;
  notice?: string; // ex.: «Pedido iniciado no perfil de …»
};

// Pesquisa e seleção dos Prestadores que recebem as solicitações diretas (RF-F009-02). Pesquisa
// enquanto o Cliente escreve, com debounce de 500 ms, e só com categoria e local (regra 11).
// Controlado e sem React Hook Form (11.7).
export function ProviderSelectionPanel({
  categoryId,
  location,
  value,
  onChange,
  error,
  notice,
}: Props) {
  const [name, setName] = useState(""); // filtro auxiliar, não enviado
  const [profileId, setProfileId] = useState<number | null>(null); // perfil aberto na janela
  const debouncedLocation = useDebouncedValue(location.trim());
  const debouncedName = useDebouncedValue(name.trim());

  // A página volta à 1 quando muda a categoria, o local ou o nome: só vale para a mesma pesquisa
  const searchKey = `${categoryId}|${debouncedLocation}|${debouncedName}`;
  const [pageState, setPageState] = useState({ key: searchKey, page: 1 });
  const page = pageState.key === searchKey ? pageState.page : 1;

  const params =
    categoryId && debouncedLocation
      ? {
          serviceCategoryId: categoryId,
          address: debouncedLocation,
          name: debouncedName || undefined,
          page: page === 1 ? undefined : page,
        }
      : null;
  const results = useSearchProviders(params);

  const isSelected = (id: number) => value.some((p) => p.professionalProfileId === id);
  const handleRemove = (id: number) =>
    onChange(value.filter((p) => p.professionalProfileId !== id));
  const handleToggle = (item: ProviderSearchItem) => {
    if (isSelected(item.professionalProfileId)) {
      handleRemove(item.professionalProfileId);
      return;
    }
    onChange([
      ...value,
      {
        professionalProfileId: item.professionalProfileId,
        name: item.name,
        serviceCategoryIds: item.serviceCategories.map((c) => c.serviceCategoryId),
      },
    ]);
  };
  const viewedDistance = results.data?.items.find(
    (i) => i.professionalProfileId === profileId,
  )?.distanceKm;

  // Desligada → indicação; ligada → loading, erro ou resultados (8.4)
  let content: ReactNode;
  if (!params) {
    content = <p className={styles.hint}>Escolha a categoria e o local para pesquisar.</p>;
  } else if (results.isPending) {
    content = <Loading />;
  } else if (results.isError) {
    content = (
      <ErrorState error={results.error} onRetry={results.refetch} retrying={results.isFetching} />
    );
  } else if (results.data.total === 0) {
    content = <EmptyState>Não foram encontrados Prestadores para esta categoria.</EmptyState>;
  } else {
    content = (
      <>
        <div className={styles.options} data-stale={results.isPlaceholderData || undefined}>
          {results.data.items.map((item) => (
            <ProviderOption
              key={item.professionalProfileId}
              result={item}
              selected={isSelected(item.professionalProfileId)}
              onToggle={() => handleToggle(item)}
              onViewProfile={() => setProfileId(item.professionalProfileId)}
            />
          ))}
        </div>
        <Pagination
          page={results.data}
          onPageChange={(next) => setPageState({ key: searchKey, page: next })}
          disabled={results.isPlaceholderData}
        />
      </>
    );
  }

  return (
    <Card>
      <h2 className={styles.title}>Prestadores selecionados ({value.length})</h2>
      {notice && <Callout icon={Info}>{notice}</Callout>}
      <div className={styles.nameFilter}>
        <Search className={styles.searchIcon} size={16} aria-hidden="true" />
        <TextField
          label="Pesquisar por nome"
          placeholder="Pesquisar por nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          // Está dentro do formulário do serviço: o Enter aqui não pode criar o serviço
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          disabled={!params}
        />
      </div>
      {value.length > 0 && (
        <ul className={styles.chips} aria-label="Prestadores selecionados">
          {value.map((p) => (
            <li key={p.professionalProfileId} className={styles.chip}>
              {p.name}
              <button
                type="button"
                className={styles.chipRemove}
                aria-label={`Retirar ${p.name}`}
                onClick={() => handleRemove(p.professionalProfileId)}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {content}

      <Modal
        open={profileId !== null}
        onOpenChange={(open) => !open && setProfileId(null)}
        title="Perfil do Prestador"
        size="lg"
      >
        {profileId !== null && (
          <ProviderProfile id={profileId} isOwn={false} hideActions distanceKm={viewedDistance} />
        )}
        <div className={styles.modalActions}>
          <Button variant="secondary" onClick={() => setProfileId(null)}>
            Fechar
          </Button>
        </div>
      </Modal>
    </Card>
  );
}
