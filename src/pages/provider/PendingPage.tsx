import { NotFoundPage } from "@/pages/public/NotFoundPage";

type Props = {
  title: string;
};

// Página provisória de um ecrã do Prestador que ainda não está implementado: só o nome do ecrã e a
// ligação para o início
export function PendingPage({ title }: Props) {
  return <NotFoundPage title={title} text="Esta página ainda não está disponível." />;
}
