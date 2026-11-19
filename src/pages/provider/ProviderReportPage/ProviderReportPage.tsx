import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { api, toQueryString } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { ProviderReport } from "@/api/types";
import { ReportPeriodFilter } from "@/components/reports/ReportPeriodFilter";
import { BarList } from "@/components/ui/BarList";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loading } from "@/components/ui/Loading";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useUrlParams } from "@/hooks/useUrlParams";
import { formatCurrency } from "@/utils/format";
import { serviceStatusLabels, serviceStatusTone } from "@/utils/labels";
import { readReportParams } from "@/utils/readReportParams";
import styles from "./ProviderReportPage.module.css";
import { RatingEvolution } from "./RatingEvolution";

export function ProviderReportPage() {
  const { params, searchParams, setFilters } = useUrlParams(readReportParams);

  const report = useQuery({
    queryKey: queryKeys.reports.provider(params),
    queryFn: () => api<ProviderReport>(`/reports/provider?${toQueryString(params)}`), // E34
    placeholderData: keepPreviousData,
  });

  // O filtro fica sempre visível: o carregamento, os erros e a falta de dados aparecem por baixo
  let results: ReactNode;
  if (report.isPending) {
    results = <Loading />;
  } else if (report.isError) {
    results = (
      <ErrorState error={report.error} onRetry={report.refetch} retrying={report.isFetching} />
    );
  } else {
    const { data } = report;
    // O período aplica-se à data de criação dos serviços, mas a evolução da classificação é por mês
    // inteiro: um período sem serviços pode ter avaliações nos seus meses, que continuam visíveis
    const hasServices =
      data.directRequestsReceived > 0 || data.proposals.accepted > 0 || data.proposals.declined > 0;
    results = hasServices ? (
      <>
        <div className={styles.stats}>
          <StatCard value={data.completedServices} label="Serviços realizados" />
          <StatCard value={data.directRequestsReceived} label="Solicitações diretas recebidas" />
          <StatCard
            value={`${data.proposals.accepted} / ${data.proposals.declined}`}
            label="Propostas aceites / recusadas"
          />
          <StatCard
            value={formatCurrency(data.totalAcceptedAmount)}
            label="Valor das propostas aceites"
            highlight
          />
        </div>
        <div className={styles.cards}>
          <Card>
            <h2 className={styles.cardTitle}>Por categoria</h2>
            <BarList items={data.byCategory.map((c) => ({ label: c.name, value: c.count }))} />
          </Card>
          <Card>
            <h2 className={styles.cardTitle}>Por estado</h2>
            <BarList
              items={data.byStatus.map((s) => ({
                label: serviceStatusLabels[s.status],
                value: s.count,
                tone: serviceStatusTone[s.status],
              }))}
            />
          </Card>
          <RatingEvolution months={data.ratingEvolution} />
        </div>
      </>
    ) : (
      <>
        <EmptyState>Sem atividade no período escolhido.</EmptyState>
        {data.ratingEvolution.length > 0 && (
          <div className={styles.cards}>
            <RatingEvolution months={data.ratingEvolution} />
          </div>
        )}
      </>
    );
  }

  return (
    <div className={styles.page}>
      <title>Relatório de atividade · LocalHub</title>
      <PageHeader
        title="Relatório de atividade"
        actions={
          <ReportPeriodFilter key={searchParams.toString()} value={params} onApply={setFilters} />
        }
      />
      <div className={styles.results} data-stale={report.isPlaceholderData || undefined}>
        {results}
      </div>
    </div>
  );
}
