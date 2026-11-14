import { Outlet, ScrollRestoration } from "react-router";
import { Header } from "./Header";
import styles from "./AppLayout.module.css";

// Moldura de todas as rotas: cabeçalho e, por baixo, a página
export function AppLayout() {
  return (
    <>
      <ScrollRestoration />
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  );
}
