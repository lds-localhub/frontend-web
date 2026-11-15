import { Navigate } from "react-router";
import { useMe } from "@/hooks/useMe";

export function CreateProfilePage() {
  const { data: me } = useMe();

  // O perfil só se cria uma vez: quem já o tem vai para o início do Prestador
  if (me!.professionalProfileId) {
    return <Navigate to="/prestador" replace />;
  }

  return (
    <>
      <title>Criar perfil profissional · LocalHub</title>
      <h1>Criar perfil profissional</h1>
    </>
  );
}
