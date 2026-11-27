import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { api, toQueryString } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { ClientReport, CompletedServiceRow } from "@/api/types";
import { ReportPeriodFilter } from "@/components/reports/ReportPeriodFilter";
import { BarList } from "@/components/ui/BarList";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loading } from "@/components/ui/Loading";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Table, type Column } from "@/components/ui/Table";
import { useUrlParams } from "@/hooks/useUrlParams";
import { formatCurrency, formatDate } from "@/utils/format";
import { serviceStatusLabels, serviceStatusTone } from "@/utils/labels";
import { readReportParams } from "@/utils/readReportParams";
import styles from "./ClientReportPage.module.css";

const historyColumns: Column<CompletedServiceRow>[] = [
  { header: "Data", cell: (s) => formatDate(s.actualCompletionDate) },
  { header: "Categoria", cell: (s) => s.serviceCategory.name },
  { header: "Prestador", cell: (s) => s.providerName },
  { header: "Valor", cell: (s) => <strong>{formatCurrency(s.amount)}</strong> },
];

export function ClientReportPage() {
  const { params, searchParams, setFilters } = useUrlParams(readReportParams);

  const report = useQuery({
    queryKey: queryKeys.reports.client(params),
    queryFn: () => api<ClientReport>(`/reports/client?${toQueryString(params)}`),
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
  } else if (report.data.contractedServices === 0) {
    results = <EmptyState>Sem atividade no período escolhido.</EmptyState>;
  } else {
    const { data } = report;
    results = (
      <>
        <div className={styles.stats}>
          <StatCard value={data.contractedServices} label="Serviços contratados" />
          <StatCard
            value={formatCurrency(data.totalAcceptedAmount)}
            label="Valor das propostas aceites"
            highlight
          />
        </div>
        <div className={styles.distributions}>
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
        </div>
        <section className={styles.history}>
          <h2>Histórico dos serviços realizados</h2>
          {data.completedHistory.length === 0 ? (
            <EmptyState>Sem serviços realizados no período escolhido.</EmptyState>
          ) : (
            <Table
              columns={historyColumns}
              rows={data.completedHistory}
              rowKey={(s) => s.serviceId}
            />
          )}
        </section>
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
