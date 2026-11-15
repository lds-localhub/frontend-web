import { Navigate, Outlet } from "react-router";
import { getToken } from "@/api/client";

// Rotas que exigem sessão: sem token, vai para o início de sessão. A segurança é sempre do backend
export function RequireAuth() {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
