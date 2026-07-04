import React, { useMemo } from 'react';
import type { Culture } from '../models/types';
import { KpiCard } from '../../../components/Data/KpiCard';

interface CultureDashboardProps {
  cultures: Culture[];
}

export const CultureDashboard: React.FC<CultureDashboardProps> = ({ cultures }) => {
  const stats = useMemo(() => {
    let platesInIncubation = 0;
    let observationDue = 0;
    let overdueObservation = 0;
    let positiveCultures = 0;
    let negativeCultures = 0;
    let contaminatedCount = 0;
    let repeatRequired = 0;

    const now = Date.now();

    cultures.forEach((c) => {
      if (c.status === 'Contaminated') contaminatedCount++;
      if (c.status === 'Repeat Required') repeatRequired++;
      if (c.status === 'Growth Detected') positiveCultures++;
      if (c.status === 'No Growth') negativeCultures++;

      c.plates.forEach((p) => {
        if (p.status === 'Incubating') {
          platesInIncubation++;
          
          const expected = new Date(p.incubation.expectedCompletionDatetime).getTime();
          if (expected < now) {
            overdueObservation++;
          } else if (expected < now + 4 * 60 * 60 * 1000) {
            // Due within 4 hours
            observationDue++;
          }
        }
      });
    });

    const totalPlates = cultures.reduce((acc, c) => acc + c.plates.length, 0);
    const contaminationRate = totalPlates > 0 ? ((contaminatedCount / totalPlates) * 100).toFixed(1) : '0.0';

    return {
      platesInIncubation,
      observationDue,
      overdueObservation,
      contaminationRate: `${contaminationRate}%`,
      positiveCultures,
      negativeCultures,
      repeatRequired,
    };
  }, [cultures]);

  const cards = [
    { id: 'inc', title: 'Plates in Incubation', value: stats.platesInIncubation, color: 'var(--color-brand-primary)' },
    { id: 'due', title: 'Observation Due (<4h)', value: stats.observationDue, color: 'orange' },
    { id: 'overdue', title: 'Overdue Observation', value: stats.overdueObservation, color: 'var(--color-status-danger)' },
    { id: 'rate', title: 'Contamination Rate', value: stats.contaminationRate, color: '#8b0000' },
    { id: 'pos', title: 'Positive Cultures', value: stats.positiveCultures, color: 'var(--color-status-success)' },
    { id: 'neg', title: 'Negative Cultures', value: stats.negativeCultures, color: 'gray' },
    { id: 'repeat', title: 'Repeat Required', value: stats.repeatRequired, color: 'purple' },
  ];

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Microbiology Inoculation Metrics</h3>
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
export default CultureDashboard;
