import { FileText, Inbox, Search } from "lucide-react";
import { Link } from "react-router";
import { DirectRequestsTable } from "@/components/directRequests/DirectRequestsTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loading } from "@/components/ui/Loading";
import { PageHeader } from "@/components/ui/PageHeader";
import { ShortcutCard } from "@/components/ui/ShortcutCard";
import { useDirectRequests } from "@/hooks/useDirectRequests";
import { useMe } from "@/hooks/useMe";
import { useSearchServices } from "@/hooks/useSearchServices";
import styles from "./ProviderHomePage.module.css";

// Início do Prestador: atalhos com os números do que tem para fazer e as solicitações pendentes
// mais recentes, para responder sem passar pela lista
export function ProviderHomePage() {
  const { data: me } = useMe();
  // Os mesmos parâmetros dão o número do atalho (o total) e a tabela (as 5 primeiras; as outras
  // estão em «Ver todas»)
  const pendingRequests = useDirectRequests({ status: "PENDING", pageSize: 5 });
  // Só interessa o total, por isso pede-se um só serviço
  const nearbyServices = useSearchServices({ withinServiceRadius: true, page: 1, pageSize: 1 });

  // Enquanto o número carrega, ou se a leitura falhar, o atalho mostra o texto sem número
  const pendingTotal = pendingRequests.isSuccess ? pendingRequests.data.total : undefined;
  const nearbyTotal = nearbyServices.isSuccess ? nearbyServices.data.total : undefined;

  const pendingTitle =
    pendingTotal === undefined
      ? "Solicitações pendentes"
      : `${pendingTotal} ${pendingTotal === 1 ? "solicitação pendente" : "solicitações pendentes"}`;
  const nearbyTitle =
    nearbyTotal === undefined
      ? "Serviços no seu raio"
      : `${nearbyTotal} ${nearbyTotal === 1 ? "serviço" : "serviços"} no seu raio`;

  return (
    <div className={styles.page}>
      <title>Início · LocalHub</title>
      <PageHeader title={`Olá, ${me?.name.split(" ")[0] ?? ""}`} />

      <div className={styles.shortcuts}>
        <ShortcutCard
          to="/solicitacoes?status=PENDING"
          title={pendingTitle}
          description="Responda com uma proposta"
          icon={Inbox}
        />
        <ShortcutCard
          to="/pesquisa/servicos?withinServiceRadius=true"
          title={nearbyTitle}
          description="Abertos a propostas"
          icon={Search}
          tone="warning"
        />
        <ShortcutCard
          to="/propostas"
          title="As minhas propostas"
          description="Acompanhe o estado"
          icon={FileText}
          tone="info"
        />
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Solicitações pendentes</h2>
          <Link to="/solicitacoes?status=PENDING" className={styles.seeAll}>
            Ver todas ›
          </Link>
        </div>
        {pendingRequests.isPending ? (
          <Loading />
        ) : pendingRequests.isError ? (
          <ErrorState
            error={pendingRequests.error}
            onRetry={pendingRequests.refetch}
            retrying={pendingRequests.isFetching}
          />
        ) : pendingRequests.data.items.length === 0 ? (
          <EmptyState>Não tem solicitações pendentes.</EmptyState>
        ) : (
          <DirectRequestsTable items={pendingRequests.data.items} />
        )}
      </section>
    </div>
  );
}
