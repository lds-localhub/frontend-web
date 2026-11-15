import { Outlet, ScrollRestoration } from "react-router";
import { getToken } from "@/api/client";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loading } from "@/components/ui/Loading";
import { useMe } from "@/hooks/useMe";
import { Header } from "./Header";
import styles from "./AppLayout.module.css";

// Moldura de todas as rotas: confirma o utilizador autenticado e desenha o cabeçalho e, por baixo, a página
export function AppLayout() {
  const me = useMe();

  // Sem token a query está desligada e fica pendente para sempre: o Visitante não pode esperar por ela
  if (getToken() && me.isPending) {
    return <Loading />;
  }

  // Só chegam aqui erros de rede ou 5xx (o 401 já recarregou para o login): a sessão pode continuar válida
  if (getToken() && me.isError) {
    return (
      <main className={styles.main}>
        <ErrorState error={me.error} onRetry={me.refetch} retrying={me.isFetching} />
      </main>
    );
  }

  return (
    <>
      <ScrollRestoration />
      <Header me={me.data} />
      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  );
}
