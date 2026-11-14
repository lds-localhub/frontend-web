import { Navigate } from "react-router";

// Rota /: sem sessão, a entrada da aplicação é a pesquisa de Prestadores
export function RootRedirect() {
  return <Navigate to="/pesquisa/prestadores" replace />;
}
