import { Navigate, Outlet } from "react-router";
import { getToken } from "@/api/client";
import type { Role } from "@/api/types";
import { useMe } from "@/hooks/useMe";
import { homeOf } from "@/utils/homeOf";

// As guardas servem só a interface: a segurança é sempre do backend, que responde 401 ou 403.

// Rotas que exigem sessão: sem sessão, vai para o início de sessão
export function RequireAuth() {
  const { data: me } = useMe();
  if (!getToken() || !me) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

// Rotas que exigem perfil profissional: o Prestador sem perfil tem de o criar primeiro
export function RequireProfile() {
  const { data: me } = useMe();
  if (me!.role === "PROVIDER" && !me!.professionalProfileId) {
    return <Navigate to="/perfil/criar" replace />;
  }
  return <Outlet />;
}

// Área de um ou mais papéis: os outros vão para o seu início
export function RequireRole({ roles }: { roles: Role[] }) {
  const { data: me } = useMe();
  if (!roles.includes(me!.role)) {
    return <Navigate to={homeOf(me!.role)} replace />;
  }
  return <Outlet />;
}
