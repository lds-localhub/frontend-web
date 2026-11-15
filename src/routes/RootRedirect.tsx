import { Navigate } from "react-router";
import { useMe } from "@/hooks/useMe";
import { homeOf } from "@/utils/homeOf";

// Rota /: com sessão, o início do papel; sem sessão, a pesquisa de Prestadores
export function RootRedirect() {
  const { data: me } = useMe();
  return <Navigate to={me ? homeOf(me.role) : "/pesquisa/prestadores"} replace />;
}
