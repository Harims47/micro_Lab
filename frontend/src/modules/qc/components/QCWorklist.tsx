import React, { useState } from 'react';
import type { QCSample } from '../models/types';
import { Card } from '../../../components/Layout/Card';
import { useGlobalState } from '../../../providers/GlobalStateProvider';
import { DataTable, type ColumnDef, ActionMenu } from '../../../components/Data';
import { Permission } from '../../../infrastructure/permissions/constants';

interface QCWorklistProps {
  samples: QCSample[];
  onSelectSample: (sample: QCSample) => void;
}

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  'Scheduled': { bg: 'var(--color-surface-base)',      text: 'var(--color-text-secondary)' },
  'Collected': { bg: 'rgba(245,158,11,0.08)',          text: 'var(--color-status-warning)' },
  'Processed': { bg: 'rgba(99,102,241,0.08)',          text: '#6366f1' },
  'Verified':  { bg: 'rgba(234,88,12,0.08)',          text: 'orange' },
  'Passed':    { bg: 'var(--color-status-success-bg)', text: 'var(--color-status-success)' },
  'Failed':    { bg: 'var(--color-status-danger-bg)',  text: 'var(--color-status-danger)' },
};

export const QCWorklist: React.FC<QCWorklistProps> = ({ samples, onSelectSample }) => {
  const { density } = useGlobalState();
  const [search, setSearch] = useState('');

  const filtered = samples.filter(
    (s) =>
      s.controlStrain.toLowerCase().includes(search.toLowerCase()) ||
      s.targetOrganism.toLowerCase().includes(search.toLowerCase()) ||
      s.sampleId.toLowerCase().includes(search.toLowerCase())
  );

  const columns: ColumnDef<QCSample>[] = [
    {
      key: 'sampleId', label: 'QC Sample ID', sortable: true,
      render: (s) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{s.sampleId}</span>,
    },
    {
      key: 'strain', label: 'Control Strain', sortable: true,
      render: (s) => <span>{s.controlStrain}</span>,
    },
    {
      key: 'organism', label: 'Target Organism', sortable: true,
      render: (s) => <strong style={{ fontStyle: 'italic' }}>{s.targetOrganism}</strong>,
    },
    {
      key: 'lot', label: 'Reagent Lot',
      render: (s) => <span style={{ fontFamily: 'var(--font-mono)' }}>{s.lotNumber}</span>,
    },
    {
      key: 'date', label: 'Scheduled Date', sortable: true,
      render: (s) => <span>{s.scheduledDate}</span>,
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (s) => {
        const style = STATUS_STYLE[s.status] ?? { bg: 'transparent', text: 'inherit' };
        return (
          <span style={{ ...styles.statusBadge, backgroundColor: style.bg, color: style.text }}>
            {s.status}
          </span>
        );
      },
    },
    {
      key: 'actions', label: 'Actions',
      render: (s) => (
        <ActionMenu
          items={[{ label: 'Open QC Run Workstation', onClick: () => onSelectSample(s), permission: Permission.VIEW_SPECIMENS }]}
          align="right"
        />
      ),
    },
  ];

  const densityClass = density === 'high-density' ? 'density-high' : density === 'compact' ? 'density-compact' : 'density-comfortable';

  return (
    <Card style={{ padding: 'var(--spacing-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <h4 style={{ margin: 0, font: 'var(--type-heading-item)' }}>Quality Control Sample Runs</h4>
        <input
          type="text"
          placeholder="Search QC runs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="lims-input"
          style={{ width: '220px', height: '32px', fontSize: '0.8rem' }}
        />
      </div>

      <div style={{ overflowX: 'auto', width: '100%' }}>
        <DataTable columns={columns} data={filtered} rowKey="sampleId" className={densityClass} />
      </div>
    </Card>
  );
};

const styles = {
  statusBadge: {
    padding: '2px 8px', borderRadius: 'var(--radius-circular)',
    fontSize: '0.72rem', fontWeight: 600,
    border: '1px solid var(--color-border-default)', whiteSpace: 'nowrap',
  },
};

export default QCWorklist;
