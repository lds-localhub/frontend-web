import styles from "./UnexpectedErrorPage.module.css";

export function UnexpectedErrorPage() {
  return (
    <main className={styles.standalone}>
      <section className={styles.card}>
        <title>Erro inesperado · LocalHub</title>
        <h1>Ocorreu um erro inesperado.</h1>
        <div className={styles.actions}>
          {/* Recarrega a aplicação inteira, porque o erro pode ter deixado o estado do router inválido */}
          <a href="/" className={styles.primary}>
            Voltar ao início
          </a>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => window.location.reload()}
          >
            Recarregar a página
          </button>
        </div>
      </section>
    </main>
  );
}
