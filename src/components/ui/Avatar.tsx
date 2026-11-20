import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import styles from "./Avatar.module.css";

// lg: o do perfil; menu: com a altura das três linhas do topo do menu da conta
type Props = { name: string; size?: "md" | "lg" | "menu" };

// Círculo com as iniciais do primeiro e do último nome
export function Avatar({ name, size = "md" }: Props) {
  const words = name.trim().split(/\s+/);
  const initials = (
    words[0][0] + (words.length > 1 ? words[words.length - 1][0] : "")
  ).toUpperCase();
  return (
    <BaseAvatar.Root className={styles.avatar} data-size={size} aria-hidden="true">
      <BaseAvatar.Fallback>{initials}</BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}
