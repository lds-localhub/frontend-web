import alertIcon from "@/assets/alert.svg";
import styles from "./FormError.module.css";

type Props = { message: string | undefined };

// Erro geral de um formulário (o que não é de nenhum campo): mostra-se por cima do botão de enviar
export function FormError({ message }: Props) {
  if (!message) {
    return null;
  }
  return (
    <p className={styles.formError} role="alert">
      <img src={alertIcon} alt="" />
      {message}
    </p>
  );
}
