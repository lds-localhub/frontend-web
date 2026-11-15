import { Navigate } from "react-router";
import { useMe } from "@/hooks/useMe";
import { homeOf } from "@/utils/homeOf";

export function ProviderSearchPage() {
  const { data: me } = useMe();

  // A pesquisa de Prestadores só existe para o Visitante e para o Cliente
  if (me && me.role !== "CLIENT") {
    return <Navigate to={homeOf(me.role)} replace />;
  }

  return (
    <>
      <title>Pesquisar Prestadores · LocalHub</title>
      <h1>Pesquisar Prestadores</h1>
    </>
  );
}
