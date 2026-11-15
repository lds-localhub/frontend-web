import type { Role } from "@/api/types";

// Página inicial de cada papel, para onde vão o início de sessão, a rota / e os redirecionamentos das guardas
export const homeOf = (role: Role) =>
  role === "CLIENT" ? "/cliente" : role === "PROVIDER" ? "/prestador" : "/admin";
