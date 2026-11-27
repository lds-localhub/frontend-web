import { Select } from "@base-ui/react/select";
import { ChevronDown } from "lucide-react";
import styles from "./FilterSelect.module.css";

export type FilterOption = { value: string; label: string };

type Props = {
  label: string;
  items: FilterOption[];
  value: string | undefined;
  onValueChange: (value: string | undefined) => void;
  disabled?: boolean;
};

// Filtro em pílula das listas («Estado: Todos»): a primeira opção, «Todos», é o filtro desligado (undefined)
export function FilterSelect({ label, items, value, onValueChange, disabled }: Props) {
  const options = [{ value: null, label: "Todos" }, ...items];

  return (
    <Select.Root
      items={options}
      value={value ?? null}
      onValueChange={(next: string | null) => onValueChange(next ?? undefined)}
      disabled={disabled}
    >
      {/* Um combobox não tira o nome do texto que mostra: sem aria-label, os testes não o acham */}
      <Select.Trigger className={styles.trigger} aria-label={label}>
        {label}: <Select.Value />
        <Select.Icon className={styles.icon}>
          <ChevronDown size={14} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner
          className={styles.positioner}
          sideOffset={6}
          alignItemWithTrigger={false}
        >
          <Select.Popup className={styles.popup}>
            <Select.List>
              {options.map((option) => (
                <Select.Item key={option.label} value={option.value} className={styles.item}>
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
