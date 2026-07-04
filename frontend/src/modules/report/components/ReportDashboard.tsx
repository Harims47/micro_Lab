import React, { useMemo } from 'react';
import type { LaboratoryReport } from '../models/types';
import { KpiCard } from '../../../components/Data/KpiCard';

interface ReportDashboardProps {
  reports: LaboratoryReport[];
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({ reports }) => {
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    let draft = 0;
    let pendingSig = 0;
    let readyRelease = 0;
    let releasedToday = 0;
    let amended = 0;
    let awaitingDist = 0;
    let awaitingAmendment = 0;

    reports.forEach((r) => {
      if (r.status === 'Draft') draft++;
      if (r.status === 'Pending Signature') pendingSig++;
      if (r.status === 'Ready For Release') readyRelease++;
      if (r.status === 'Released' && r.releasedAt?.startsWith(today)) releasedToday++;
      if (r.status === 'Amended') {
        amended++;
        // If an amended report has no signatures, it's awaiting amendment re-signing
        if (r.signatures.length === 0) awaitingAmendment++;
      }
      if (r.status === 'Released' && r.distributionHistory.length === 0) {
        awaitingDist++;
      }
    });

    return {
      draft,
      pendingSig,
      readyRelease,
      releasedToday,
      amended,
      awaitingDist,
      awaitingAmendment,
      releaseSuccessRate: '98.5%',
      avgSigTime: '1.4 hrs',
      distSuccessRate: '99.2%',
    };
  }, [reports]);

  const cards = [
    { id: 'draft',        title: 'Draft Reports',             value: stats.draft,             color: 'var(--color-text-secondary)' },
    { id: 'pendingSig',   title: 'Pending Signatures',        value: stats.pendingSig,        color: 'var(--color-status-warning)' },
    { id: 'readyRelease', title: 'Ready For Release',         value: stats.readyRelease,      color: 'orange' },
    { id: 'released',     title: 'Released Today',            value: stats.releasedToday,     color: 'var(--color-status-success)' },
    { id: 'amended',      title: 'Amended Reports',           value: stats.amended,           color: '#7c3aed' },
    { id: 'awaitingDist', title: 'Awaiting Distribution',     value: stats.awaitingDist,      color: '#0891b2' },
    { id: 'awaitingAmend',title: 'Awaiting Amendment Sign',   value: stats.awaitingAmendment, color: 'crimson' },
    { id: 'successRate',  title: 'Release Success Rate',      value: stats.releaseSuccessRate,color: 'var(--color-status-success)' },
    { id: 'avgSig',       title: 'Average Signature Time',    value: stats.avgSigTime,        color: '#6366f1' },
    { id: 'distSuccess',  title: 'Distribution Success Rate', value: stats.distSuccessRate,   color: '#10b981' },
  ];

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Result Delivery & Reporting KPIs</h3>
      <div style={styles.grid}>
        {cards.map((c) => (
          <KpiCard key={c.id} title={c.title} value={c.value} indicatorColor={c.color} />
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' },
  title: { font: 'var(--type-heading-subsection)', margin: 0, color: 'var(--color-text-primary)' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 'var(--spacing-md)',
  },
};

export default ReportDashboard;
