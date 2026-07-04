import React, { useMemo } from 'react';
import type { AstResult } from '../models/types';
import { KpiCard } from '../../../components/Data/KpiCard';

interface AstDashboardProps {
  asts: AstResult[];
}

export const AstDashboard: React.FC<AstDashboardProps> = ({ asts }) => {
  const stats = useMemo(() => {
    let inTesting = 0;
    let pendingReview = 0;
    let approvedToday = 0;
    let totalResistant = 0;
    let totalInterpreted = 0;
    let completedToday = 0;

    let clsiCount = 0;
    let eucastCount = 0;
    let diskCount = 0;
    let micCount = 0;

    const today = new Date().toISOString().slice(0, 10);

    asts.forEach((a) => {
      if (a.status === 'In Testing') inTesting++;
      if (a.status === 'Pending Technical Review') pendingReview++;
      if (a.status === 'Testing Completed') completedToday++;

      if (a.guideline === 'CLSI 2026') clsiCount++;
      else eucastCount++;

      if (a.status === 'Approved' && a.reviewTimestamp?.startsWith(today)) {
        approvedToday++;
      }

      a.agentResults.forEach((r) => {
        if (r.interpretation === 'R') totalResistant++;
        if (r.interpretation !== 'Not Tested' && r.interpretation !== 'Invalid') {
          totalInterpreted++;
        }
        if (r.method === 'Disk Diffusion') diskCount++;
        else if (r.method === 'MIC' || r.method === 'Broth Microdilution') micCount++;
      });
    });

    const resistanceRate =
      totalInterpreted > 0 ? ((totalResistant / totalInterpreted) * 100).toFixed(1) + '%' : '—';
    const avgTat = `${(2 + (asts.length % 3)).toFixed(1)} hrs`; // mock turnaround

    return {
      total: asts.length,
      inTesting,
      pendingReview,
      approvedToday,
      resistanceRate,
      avgTat,
      completedToday,
      clsiCount,
      eucastCount,
      diskCount,
      micCount,
    };
  }, [asts]);

  const cards = [
    { id: 'total',    title: 'Total AST Records',         value: stats.total,         color: 'var(--color-brand-primary)' },
    { id: 'testing',  title: 'In Active Testing',         value: stats.inTesting,     color: 'var(--color-status-warning)' },
    { id: 'pending',  title: 'Pending Technical Review',  value: stats.pendingReview, color: 'orange' },
    { id: 'approved', title: 'Approved Today',            value: stats.approvedToday, color: 'var(--color-status-success)' },
    { id: 'resist',   title: 'Resistance Rate',           value: stats.resistanceRate, color: 'var(--color-status-danger)' },
    { id: 'tat',      title: 'Avg Turnaround Time',       value: stats.avgTat,        color: 'purple' },
    { id: 'completed',title: 'Testing Completed',         value: stats.completedToday, color: '#0891b2' },
    { id: 'clsi',     title: 'CLSI Guideline Usage',      value: stats.clsiCount,     color: '#6366f1' },
    { id: 'disk',     title: 'Disk Diffusion Tests',      value: stats.diskCount,     color: '#f59e0b' },
    { id: 'mic',      title: 'MIC / Broth Tests',         value: stats.micCount,      color: '#10b981' },
  ];

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>AST Susceptibility Testing KPIs</h3>
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
  title: {
    font: 'var(--type-heading-subsection)',
    margin: 0,
    color: 'var(--color-text-primary)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 'var(--spacing-md)',
  },
};

export default AstDashboard;
