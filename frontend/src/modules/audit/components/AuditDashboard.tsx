import React from 'react';
import { KpiCard } from '../../../components/Data/KpiCard';
import type { ComplianceSummary } from '../models/types';

interface AuditDashboardProps {
  summary: ComplianceSummary;
}

export const AuditDashboard: React.FC<AuditDashboardProps> = ({ summary }) => {
  const cards = [
    { id: 'total-ev',  title: 'Total Audited Events',   value: summary.totalEvents,            color: 'var(--color-brand-primary)' },
    { id: 'crit-ev',   title: 'Critical Events Logged', value: summary.criticalEventsCount,     color: 'orange' },
    { id: 'sec-viol',  title: 'Security Violations',    value: summary.securityViolationsCount, color: 'var(--color-status-danger)' },
    { id: 'comp-score',title: 'System Compliance Score',value: `${summary.complianceScore}%`,  color: 'var(--color-status-success)' },
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--spacing-md)',
    marginBottom: 'var(--spacing-md)',
  },
};

export default AuditDashboard;
