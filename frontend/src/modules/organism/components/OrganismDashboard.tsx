import React, { useMemo } from 'react';
import type { Colony } from '../models/types';
import { KpiCard } from '../../../components/Data/KpiCard';

interface OrganismDashboardProps {
  colonies: Colony[];
}

export const OrganismDashboard: React.FC<OrganismDashboardProps> = ({ colonies }) => {
  const stats = useMemo(() => {
    let gramPositive = 0;
    let gramNegative = 0;
    let mixedCultures = 0;
    let awaitingReview = 0;
    let qcPending = 0;
    let totalIdentified = 0;
    let qcFailed = 0;

    // Mixed culture lookup by accession mapping
    const accessionCounts: Record<string, number> = {};

    colonies.forEach((c) => {
      if (c.gramStain) {
        if (c.gramStain.reaction === 'Gram Positive') gramPositive++;
        if (c.gramStain.reaction === 'Gram Negative') gramNegative++;
      }

      if (c.status === 'Under Identification') awaitingReview++;
      if (c.qcStatus === 'Pending QC') qcPending++;
      if (c.qcStatus === 'QC Failed') qcFailed++;
      if (['Identified', 'Sent to AST', 'Completed'].includes(c.status)) {
        totalIdentified++;
      }

      if (c.cultureAccession) {
        accessionCounts[c.cultureAccession] = (accessionCounts[c.cultureAccession] || 0) + 1;
      }
    });

    // Count how many cultures have more than 1 isolated colony
    Object.values(accessionCounts).forEach((count) => {
      if (count > 1) mixedCultures++;
    });

    const successRate = totalIdentified > 0 ? ((totalIdentified / (totalIdentified + qcFailed)) * 100).toFixed(1) : '100.0';

    return {
      gramPositive,
      gramNegative,
      mixedCultures,
      awaitingReview,
      qcPending,
      successRate: `${successRate}%`,
    };
  }, [colonies]);

  const cards = [
    { id: 'pos', title: 'Gram Positive Isolates', value: stats.gramPositive, color: 'purple' },
    { id: 'neg', title: 'Gram Negative Isolates', value: stats.gramNegative, color: '#e67e22' },
    { id: 'mixed', title: 'Mixed Cultures Detected', value: stats.mixedCultures, color: 'blue' },
    { id: 'review', title: 'Awaiting Clinical Review', value: stats.awaitingReview, color: 'orange' },
    { id: 'qc', title: 'QC Verification Pending', value: stats.qcPending, color: 'var(--color-status-danger)' },
    { id: 'rate', title: 'ID Success Rate', value: stats.successRate, color: 'var(--color-status-success)' },
  ];

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Colony Organism Identification KPIs</h3>
      <div style={styles.grid}>
        {cards.map((c) => (
          <KpiCard
            key={c.id}
            title={c.title}
            value={c.value}
            indicatorColor={c.color}
          />
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  },
  title: {
    font: 'var(--type-heading-subsection)',
    margin: 0,
    color: 'var(--color-text-primary)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--spacing-md)',
  },
};
export default OrganismDashboard;
