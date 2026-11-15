import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import styles from "./Avatar.module.css";

type Props = { name: string };

// Círculo com as iniciais do primeiro e do último nome
export function Avatar({ name }: Props) {
  const words = name.trim().split(/\s+/);
  const initials = (
    words[0][0] + (words.length > 1 ? words[words.length - 1][0] : "")
  ).toUpperCase();
  return (
    <BaseAvatar.Root className={styles.avatar} aria-hidden="true">
      <BaseAvatar.Fallback>{initials}</BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}
