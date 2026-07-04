import React from 'react';
import { KpiCard } from '../../../components/Data/KpiCard';
import type { KPIResult } from '../models/types';

interface AnalyticsDashboardProps {
  kpis: KPIResult;
  positiveRate: number;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ kpis, positiveRate }) => {
  const cards = [
    { id: 'tat',          title: 'Average Turnaround Time', value: `${kpis.turnaroundTime} hrs`, color: '#6366f1' },
    { id: 'pending-ord',  title: 'Pending Requisitions',   value: kpis.pendingOrders,            color: 'orange' },
    { id: 'pending-spec', title: 'Awaiting Accession',      value: kpis.pendingSpecimens,         color: 'var(--color-brand-primary)' },
    { id: 'pending-val',  title: 'Awaiting Validation',      value: kpis.pendingValidation,        color: 'purple' },
    { id: 'pending-rep',  title: 'Awaiting Release',        value: kpis.pendingReports,           color: '#0891b2' },
    { id: 'pos-rate',     title: 'Positivity Rate',        value: `${positiveRate}%`,            color: 'var(--color-status-success)' },
  ];

  return (
    <div style={styles.grid}>
      {cards.map((c) => (
        <KpiCard key={c.id} title={c.title} value={c.value} indicatorColor={c.color} />
      ))}
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))',
    gap: 'var(--spacing-md)',
    marginBottom: 'var(--spacing-md)',
  },
};

export default AnalyticsDashboard;
