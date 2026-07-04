import React, { useMemo } from 'react';
import type { ValidationRecord } from '../models/types';
import { KpiCard } from '../../../components/Data/KpiCard';

interface ValidationDashboardProps {
  records: ValidationRecord[];
}

export const ValidationDashboard: React.FC<ValidationDashboardProps> = ({ records }) => {
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    let pendingTech = 0;
    let pendingClinical = 0;
    let pendingPathologist = 0;
    let returned = 0;
    let rejected = 0;
    let approvedToday = 0;
    let released = 0;
    let stat = 0;
    let urgent = 0;

    // Reviewer workload: count assignments
    const workloadMap: Record<string, number> = {};

    records.forEach((r) => {
      if (r.status === 'Pending Technical Validation' || r.status === 'Technical Validation In Progress') pendingTech++;
      if (r.status === 'Pending Clinical Validation' || r.status === 'Clinical Validation In Progress') pendingClinical++;
      if (r.status === 'Approved' && r.completedAt?.startsWith(today)) approvedToday++;
      if (r.status === 'Rejected') rejected++;
      if (r.status === 'Returned For Correction') returned++;
      if (r.status === 'Released For Reporting') released++;
      if (r.priority === 'Stat') stat++;
      if (r.priority === 'Urgent') urgent++;

      // Count pathologist stage pending
      const pathStage = r.stages.find((s) => s.type === 'Pathologist');
      if (pathStage && pathStage.status === 'Pending') pendingPathologist++;

      // Workload
      r.stages.forEach((s) => {
        if (s.assignment?.assignedTo) {
          workloadMap[s.assignment.assignedTo] = (workloadMap[s.assignment.assignedTo] ?? 0) + 1;
        }
      });
    });

    const busyReviewer = Object.entries(workloadMap).sort((a, b) => b[1] - a[1])[0];
    const avgProgress =
      records.length > 0
        ? Math.round(records.reduce((sum, r) => sum + r.summary.overallProgress, 0) / records.length)
        : 0;

    return {
      total: records.length,
      pendingTech,
      pendingClinical,
      pendingPathologist,
      returned,
      rejected,
      approvedToday,
      released,
      stat,
      urgent,
      busyReviewer: busyReviewer ? `${busyReviewer[0]} (${busyReviewer[1]})` : '—',
      avgProgress: `${avgProgress}%`,
    };
  }, [records]);

  const cards = [
    { id: 'total',    title: 'Total Validations',          value: stats.total,           color: 'var(--color-brand-primary)' },
    { id: 'tech',     title: 'Pending Technical Review',   value: stats.pendingTech,     color: 'var(--color-status-warning)' },
    { id: 'clinical', title: 'Pending Clinical Review',    value: stats.pendingClinical, color: 'orange' },
    { id: 'path',     title: 'Pending Pathologist Review', value: stats.pendingPathologist, color: '#7c3aed' },
    { id: 'returned', title: 'Returned For Correction',    value: stats.returned,        color: 'crimson' },
    { id: 'rejected', title: 'Rejected Cases',             value: stats.rejected,        color: 'var(--color-status-danger)' },
    { id: 'approved', title: 'Approved Today',             value: stats.approvedToday,   color: 'var(--color-status-success)' },
    { id: 'released', title: 'Released For Reporting',     value: stats.released,        color: '#0891b2' },
    { id: 'stat',     title: 'STAT Priority Cases',        value: stats.stat,            color: '#dc2626' },
    { id: 'progress', title: 'Avg Validation Progress',    value: stats.avgProgress,     color: '#6366f1' },
  ];

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Validation Platform KPIs</h3>
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

export default ValidationDashboard;
