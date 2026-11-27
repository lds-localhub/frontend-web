import { Link } from "react-router";
import { useMe } from "@/hooks/useMe";
import { homeOf } from "@/utils/homeOf";
import styles from "./NotFoundPage.module.css";

type Props = {
  title?: string;
  text?: string;
  action?: { to: string; label: string }; // sem ação, volta ao início do perfil
};

// Página não encontrada; com textos próprios para um recurso que não existe (ex.: um Prestador)
export function NotFoundPage({
  title = "Página não encontrada",
  text = "A página que procura não existe.",
  action,
}: Props) {
  const { data: me } = useMe();
  const to = action?.to ?? (me ? homeOf(me.role) : "/pesquisa/prestadores");
  return (
    <section className={styles.card}>
      <title>{`${title} · LocalHub`}</title>
      <h1>{title}</h1>
      <p className={styles.text}>{text}</p>
      <div className={styles.actions}>
        <Link to={to} className={styles.primary}>
          {action?.label ?? "Voltar ao início"}
        </Link>
      </div>
    </section>
  );
}
