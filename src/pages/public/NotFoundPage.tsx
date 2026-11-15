import { Link } from "react-router";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  return (
    <section className={styles.card}>
      <title>Página não encontrada · LocalHub</title>
      <h1>Página não encontrada</h1>
      <p className={styles.text}>A página que procura não existe.</p>
      <div className={styles.actions}>
        <Link to="/pesquisa/prestadores" className={styles.primary}>
          Voltar ao início
        </Link>
      </div>
    </section>
  );
}
