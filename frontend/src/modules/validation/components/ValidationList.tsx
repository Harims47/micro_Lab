import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { ValidationRecord } from '../models/types';
import { ValidationService } from '../services/validationService';
import { Permission } from '../../../infrastructure/permissions/constants';
import { useGlobalState } from '../../../providers/GlobalStateProvider';

import { PageContainer, ContentCard, ModuleToolbar } from '../../../components/Layout';
import { DataTable, type ColumnDef, ActionMenu, Pagination } from '../../../components/Data';

interface ValidationListProps {
  onViewDetails: (id: string) => void;
}

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  'Created':                          { bg: 'var(--color-surface-base)',           text: 'var(--color-text-secondary)' },
  'Pending Technical Validation':     { bg: 'rgba(245,158,11,0.08)',               text: 'var(--color-status-warning)' },
  'Technical Validation In Progress': { bg: 'rgba(99,102,241,0.08)',               text: '#6366f1' },
  'Pending Clinical Validation':      { bg: 'rgba(234,88,12,0.08)',               text: 'orange' },
  'Clinical Validation In Progress':  { bg: 'rgba(124,58,237,0.08)',              text: '#7c3aed' },
  'Approved':                         { bg: 'var(--color-status-success-bg)',      text: 'var(--color-status-success)' },
  'Rejected':                         { bg: 'var(--color-status-danger-bg)',       text: 'var(--color-status-danger)' },
  'Returned For Correction':          { bg: 'rgba(161,0,0,0.06)',                  text: 'crimson' },
  'Released For Reporting':           { bg: 'rgba(8,145,178,0.08)',               text: '#0891b2' },
};

const PRIORITY_STYLE: Record<string, React.CSSProperties> = {
  'Stat':    { color: '#dc2626', fontWeight: 700, fontSize: '0.72rem' },
  'Urgent':  { color: 'orange',  fontWeight: 700, fontSize: '0.72rem' },
  'Routine': { color: 'var(--color-text-secondary)', fontSize: '0.72rem' },
};

export const ValidationList: React.FC<ValidationListProps> = ({ onViewDetails }) => {
  const { density } = useGlobalState();

  const [records, setRecords] = useState<ValidationRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ValidationService.getRecords({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        status: statusFilter === 'All' ? undefined : statusFilter,
        priority: priorityFilter === 'All' ? undefined : priorityFilter,
      });
      setRecords(res.records);
      setTotal(res.total);
    } catch (e: any) {
      setError(e.message || 'Failed to load validation worklist.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter, priorityFilter]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const progressBar = (val: number) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: '60px', height: '6px', borderRadius: '3px', backgroundColor: 'var(--color-border-default)', overflow: 'hidden' }}>
        <div style={{ width: `${val}%`, height: '100%', backgroundColor: val === 100 ? 'var(--color-status-success)' : 'var(--color-brand-primary)', transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>{val}%</span>
    </div>
  );

  const columns = useMemo<ColumnDef<ValidationRecord>[]>(() => [
    {
      key: 'validationId', label: 'Validation ID', sortable: true,
      render: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.validationId}</span>,
    },
    {
      key: 'astId', label: 'AST ID',
      render: (r) => <span style={{ fontFamily: 'var(--font-mono)' }}>{r.astId}</span>,
    },
    {
      key: 'patientName', label: 'Patient', sortable: true,
      render: (r) => <span>{r.patientName ?? '—'}</span>,
    },
    {
      key: 'organismName', label: 'Organism', sortable: true,
      render: (r) => <strong style={{ fontSize: '0.82rem' }}>{r.organismName}</strong>,
    },
    {
      key: 'priority', label: 'Priority',
      render: (r) => <span style={PRIORITY_STYLE[r.priority]}>{r.priority}</span>,
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (r) => {
        const s = STATUS_STYLE[r.status] ?? { bg: 'transparent', text: 'inherit' };
        return (
          <span style={{ ...styles.statusBadge, backgroundColor: s.bg, color: s.text }}>
            {r.status}
          </span>
        );
      },
    },
    {
      key: 'progress', label: 'Progress',
      render: (r) => progressBar(r.summary.overallProgress),
    },
    {
      key: 'actions', label: 'Actions',
      render: (r) => (
        <ActionMenu
          items={[{ label: 'Review Case', onClick: () => onViewDetails(r.validationId), permission: Permission.VIEW_SPECIMENS }]}
          align="right"
        />
      ),
    },
  ], [onViewDetails]);

  const activeChips = useMemo(() => {
    const list = [];
    if (statusFilter !== 'All') list.push({ key: 'status', label: 'Status', valueLabel: statusFilter });
    if (priorityFilter !== 'All') list.push({ key: 'priority', label: 'Priority', valueLabel: priorityFilter });
    return list;
  }, [statusFilter, priorityFilter]);

  const extraFilters = (
    <div style={{ display: 'flex', gap: '8px' }}>
      <select
        value={statusFilter}
        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        className="lims-input"
        style={{ height: '34px', padding: '0 6px', fontSize: '0.8rem' }}
      >
        <option value="All">All Statuses</option>
        <option value="Created">Created</option>
        <option value="Pending Technical Validation">Pending Tech</option>
        <option value="Technical Validation In Progress">Tech In Progress</option>
        <option value="Pending Clinical Validation">Pending Clinical</option>
        <option value="Clinical Validation In Progress">Clinical In Progress</option>
        <option value="Approved">Approved</option>
        <option value="Rejected">Rejected</option>
        <option value="Returned For Correction">Returned</option>
        <option value="Released For Reporting">Released</option>
      </select>
      <select
        value={priorityFilter}
        onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
        className="lims-input"
        style={{ height: '34px', padding: '0 6px', fontSize: '0.8rem' }}
      >
        <option value="All">All Priorities</option>
        <option value="Stat">STAT</option>
        <option value="Urgent">Urgent</option>
        <option value="Routine">Routine</option>
      </select>
    </div>
  );

  const densityClass = density === 'high-density' ? 'density-high' : density === 'compact' ? 'density-compact' : 'density-comfortable';

  return (
    <PageContainer>
      <ModuleToolbar
        title="Validation Worklist"
        subtitle="Technical, Clinical & Pathologist Validation — Laboratory Authorization Pipeline"
        searchValue={searchQuery}
        onSearchChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
        searchPlaceholder="Search VAL ID, AST, organism, patient..."
        filterItems={activeChips}
        onRemoveFilter={(key) => { if (key === 'status') setStatusFilter('All'); else setPriorityFilter('All'); }}
        onClearAllFilters={() => { setStatusFilter('All'); setPriorityFilter('All'); }}
        onRefresh={fetchRecords}
        onCreate={records.length > 0 ? () => onViewDetails(records[0].validationId) : undefined}
        createLabel="Review Case"
        extraFilters={extraFilters}
      />

      <ContentCard
        loading={loading} error={error}
        empty={!loading && records.length === 0}
        emptyTitle="No Validation Records Found"
        emptyDescription="No cases match the current filters."
        onRetry={fetchRecords}
      >
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <DataTable columns={columns} data={records} rowKey="validationId" className={densityClass} />
        </div>
      </ContentCard>

      {!loading && !error && records.length > 0 && (
        <div style={styles.footer}>
          <span style={{ font: 'var(--type-body-small)', color: 'var(--color-text-secondary)' }}>
            Showing {Math.min(total, (currentPage - 1) * pageSize + 1)}–{Math.min(total, currentPage * pageSize)} of {total}
          </span>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(total / pageSize)}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </PageContainer>
  );
};

const styles: Record<string, React.CSSProperties> = {
  statusBadge: {
    padding: '2px 8px', borderRadius: 'var(--radius-circular)',
    fontSize: '0.72rem', fontWeight: 600,
    border: '1px solid var(--color-border-default)', whiteSpace: 'nowrap',
  },
  footer: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderTop: '1px solid var(--color-border-default)',
    paddingTop: 'var(--spacing-sm)',
    flexWrap: 'wrap', gap: 'var(--spacing-md)',
    width: '100%', boxSizing: 'border-box',
  },
};

export default ValidationList;
