import { Button as BaseButton } from "@base-ui/react/button";
import type { ComponentProps } from "react";
import { Link } from "react-router";
import styles from "./Button.module.css";

type Props = Omit<ComponentProps<"button">, "className"> & {
  variant?: "primary" | "secondary" | "danger" | "danger-outline" | "text";
  to?: string; // com destino, é uma ligação do router com o aspeto de botão (ex.: «Criar conta»)
};

// Botão principal (verde), secundário (contorno), de perigo (vermelho,
// cheio ou só com contorno) ou só texto
export function Button({ variant = "primary", to, type = "button", ...rest }: Props) {
  if (to !== undefined) {
    return (
      <BaseButton
        {...rest}
        nativeButton={false}
        render={<Link to={to} />}
        className={styles.button}
        data-variant={variant}
      />
    );
  }
  return <BaseButton {...rest} type={type} className={styles.button} data-variant={variant} />;
}
