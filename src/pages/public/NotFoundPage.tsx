import { Link } from "react-router";
import { useMe } from "@/hooks/useMe";
import { homeOf } from "@/utils/homeOf";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  const { data: me } = useMe();
  return (
    <section className={styles.card}>
      <title>Página não encontrada · LocalHub</title>
      <h1>Página não encontrada</h1>
      <p className={styles.text}>A página que procura não existe.</p>
      <div className={styles.actions}>
        <Link to={me ? homeOf(me.role) : "/pesquisa/prestadores"} className={styles.primary}>
          Voltar ao início
        </Link>
      </div>
    </section>
  );
}
