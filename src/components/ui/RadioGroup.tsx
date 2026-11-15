import { Fieldset } from "@base-ui/react/fieldset";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import styles from "./RadioGroup.module.css";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  label: string;
  name: string;
  value: T;
  onValueChange: (value: T) => void;
  options: Option<T>[];
  error?: string;
};

// Escolha única entre poucas opções, todas visíveis (ex.: o tipo de conta no registo)
export function RadioGroup<T extends string>({
  label,
  name,
  value,
  onValueChange,
  options,
  error,
}: Props<T>) {
  return (
    <Fieldset.Root className={styles.fieldset}>
      <Fieldset.Legend className={styles.legend}>{label}</Fieldset.Legend>
      <BaseRadioGroup
        name={name}
        value={value}
        onValueChange={(v) => onValueChange(v as T)}
        className={styles.group}
      >
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <Radio.Root value={option.value} className={styles.radio}>
              <Radio.Indicator className={styles.indicator} />
            </Radio.Root>
            {option.label}
          </label>
        ))}
      </BaseRadioGroup>
      {error && <p className={styles.error}>{error}</p>}
    </Fieldset.Root>
  );
}
