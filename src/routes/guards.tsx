import { Navigate, Outlet } from "react-router";

// Rotas que exigem sessão: sem token, vai para o início de sessão. A segurança é sempre do backend
export function RequireAuth() {
  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
