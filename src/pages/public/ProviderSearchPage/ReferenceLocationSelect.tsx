import { Select } from "@/components/ui/Select";

export type ReferenceLocation = "registered" | "other";

type Props = {
  value: ReferenceLocation;
  registeredAddress: string;
  onChange: (value: ReferenceLocation) => void;
};

// Localização de referência do Cliente com localização registada: a registada (por omissão) ou
// outro endereço, que serve só para esta pesquisa e não altera a registada (RF-F005-02, regras 1 a 3)
export function ReferenceLocationSelect({ value, registeredAddress, onChange }: Props) {
  return (
    <Select
      label="Localização de referência"
      items={[
        { value: "registered", label: `A minha localização — ${registeredAddress}` },
        { value: "other", label: "Outro endereço" },
      ]}
      value={value}
      onValueChange={(next) => onChange(next === "other" ? "other" : "registered")}
    />
  );
}
