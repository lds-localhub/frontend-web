import { Fieldset } from "@base-ui/react/fieldset";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Star } from "lucide-react";
import type { Ref } from "react";
import styles from "./StarRatingField.module.css";

type Props = {
  label: string;
  value: number | undefined;
  onValueChange: (value: number) => void;
  meanings: Record<number, string>; // texto de cada classificação, mostrado ao lado das estrelas
  error?: string;
  focusRef?: Ref<HTMLElement>; // o field.ref do Controller: o foco do erro vai para a 1.ª estrela
};

// Classificação de 1 a 5 estrelas: uma escolha única (rádios), com o significado da escolhida ao lado
export function StarRatingField({ label, value, onValueChange, meanings, error, focusRef }: Props) {
  return (
    <Fieldset.Root className={styles.fieldset}>
      <Fieldset.Legend className={styles.legend}>{label}</Fieldset.Legend>
      <div className={styles.row}>
        <RadioGroup
          value={value ?? null}
          onValueChange={(v) => onValueChange(Number(v))}
          className={styles.group}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <Radio.Root
              key={n}
              ref={n === 1 ? focusRef : undefined}
              value={n}
              className={styles.star}
              data-filled={(value !== undefined && n <= value) || undefined}
              aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"}: ${meanings[n]}`}
            >
              <Star size={28} />
            </Radio.Root>
          ))}
        </RadioGroup>
        {value !== undefined && <span className={styles.meaning}>{meanings[value]}</span>}
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </Fieldset.Root>
  );
}
