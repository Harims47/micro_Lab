import React, { useMemo } from 'react';
import { KpiCard } from '../../../components/Data/KpiCard';
import type { QCSample, QCInstrument, QCReagent } from '../models/types';

interface QCDashboardProps {
  samples: QCSample[];
  instruments: QCInstrument[];
  reagents: QCReagent[];
}

export const QCDashboard: React.FC<QCDashboardProps> = ({ samples, instruments, reagents }) => {
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    const passed = samples.filter((s) => s.status === 'Passed').length;
    const failed = samples.filter((s) => s.status === 'Failed').length;
    const totalRuns = passed + failed;
    const passRate = totalRuns > 0 ? `${Math.round((passed / totalRuns) * 100)}%` : '—';

    const pending = samples.filter((s) => ['Scheduled', 'Collected', 'Processed', 'Verified'].includes(s.status)).length;
    const offline = instruments.filter((i) => i.status === 'Offline').length;

    const dueToday = samples.filter((s) => s.scheduledDate === today).length;
    const overdue = samples.filter((s) => s.scheduledDate < today && s.status === 'Scheduled').length;

    const calibrationDue = instruments.filter(
      (i) => i.status === 'Calibration Due' || (i.nextCalibrationDueDate && i.nextCalibrationDueDate < today)
    ).length;

    const reagentsExpiring = reagents.filter((r) => {
      const exp = new Date(r.expirationDate).getTime();
      const differenceDays = (exp - Date.now()) / (1000 * 360 * 24);
      return differenceDays > 0 && differenceDays <= 7; // within 7 days
    }).length;

    return {
      passRate,
      failed,
      pending,
      offline,
      dueToday,
      overdue,
      calibrationDue,
      reagentsExpiring,
    };
  }, [samples, instruments, reagents]);

  const cards = [
    { id: 'pass-rate',   title: 'QC Pass Rate',               value: stats.passRate,        color: 'var(--color-status-success)' },
    { id: 'failed',      title: 'Failed QC Controls',         value: stats.failed,          color: 'var(--color-status-danger)' },
    { id: 'pending',     title: 'Pending QC Controls',        value: stats.pending,         color: 'var(--color-status-warning)' },
    { id: 'offline',     title: 'Offline Instruments',        value: stats.offline,         color: 'crimson' },
    { id: 'due-today',   title: 'QC Runs Due Today',          value: stats.dueToday,        color: '#6366f1' },
    { id: 'overdue',     title: 'Overdue QC Runs',            value: stats.overdue,         color: '#7c3aed' },
    { id: 'cal-due',     title: 'Instruments Due Calibration', value: stats.calibrationDue,  color: 'orange' },
    { id: 'reg-exp',     title: 'Reagents Near Expiry',       value: stats.reagentsExpiring,color: 'purple' },
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

export default QCDashboard;
