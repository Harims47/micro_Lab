import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { AstResult } from '../models/types';
import { AstService } from '../services/astService';
import { usePermission } from '../../../infrastructure/permissions/usePermission';
import { Permission } from '../../../infrastructure/permissions/constants';
import { useGlobalState } from '../../../providers/GlobalStateProvider';

import { PageContainer, ContentCard, ModuleToolbar } from '../../../components/Layout';
import { DataTable, type ColumnDef, ActionMenu, Pagination } from '../../../components/Data';

interface AstListProps {
  onViewDetails: (id: string) => void;
  onCreateAst: () => void;
}

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  'Created':                   { bg: 'var(--color-surface-base)',           text: 'var(--color-text-secondary)' },
  'Panel Assigned':            { bg: 'rgba(99,102,241,0.08)',               text: '#6366f1' },
  'In Testing':                { bg: 'rgba(245,158,11,0.08)',               text: 'var(--color-status-warning)' },
  'Testing Completed':         { bg: 'rgba(8,145,178,0.08)',               text: '#0891b2' },
  'Pending Technical Review':  { bg: 'rgba(234,88,12,0.08)',               text: 'orange' },
  'Approved':                  { bg: 'var(--color-status-success-bg)',      text: 'var(--color-status-success)' },
  'Rejected':                  { bg: 'var(--color-status-danger-bg)',       text: 'var(--color-status-danger)' },
  'Returned For Correction':   { bg: 'rgba(161,0,0,0.06)',                  text: 'crimson' },
};

export const AstList: React.FC<AstListProps> = ({ onViewDetails, onCreateAst }) => {
  const { hasPermission } = usePermission();
  const { density } = useGlobalState();

  const canCreate = hasPermission(Permission.REGISTER_SPECIMEN);

  const [asts, setAsts] = useState<AstResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchAsts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AstService.getAstRecords({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        status: statusFilter === 'All' ? undefined : statusFilter,
      });
      setAsts(res.asts);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve AST worklist.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter]);

  useEffect(() => {
    fetchAsts();
  }, [fetchAsts]);

  const interpretationSummary = (ast: AstResult) => {
    const counts: Record<string, number> = { S: 0, I: 0, R: 0 };
    ast.agentResults.forEach((r) => {
      const k = r.overrideInterpretation ?? r.interpretation;
      if (k === 'S' || k === 'I' || k === 'R') counts[k]++;
    });
    return (
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {counts.S > 0 && <span style={styles.sTag}>S:{counts.S}</span>}
        {counts.I > 0 && <span style={styles.iTag}>I:{counts.I}</span>}
        {counts.R > 0 && <span style={styles.rTag}>R:{counts.R}</span>}
        {counts.S + counts.I + counts.R === 0 && <span style={{ color: 'gray', fontSize: '0.75rem' }}>—</span>}
      </div>
    );
  };

  const columns = useMemo<ColumnDef<AstResult>[]>(() => [
    {
      key: 'astId',
      label: 'AST ID',
      sortable: true,
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.astId}</span>
      ),
    },
    {
      key: 'colonyId',
      label: 'Colony ID',
      sortable: true,
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)' }}>{row.colonyId}</span>
      ),
    },
    {
      key: 'organismName',
      label: 'Organism',
      sortable: true,
      render: (row) => <strong>{row.organismName}</strong>,
    },
    {
      key: 'guideline',
      label: 'Guideline',
      render: (row) => (
        <span style={styles.guidelineBadge}>{row.guideline}</span>
      ),
    },
    {
      key: 'summary',
      label: 'S / I / R',
      render: (row) => interpretationSummary(row),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const colors = STATUS_COLOR[row.status] ?? { bg: 'transparent', text: 'inherit' };
        return (
          <span style={{
            ...styles.statusBadge,
            backgroundColor: colors.bg,
            color: colors.text,
          }}>
            {row.status}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <ActionMenu
          items={[
            {
              label: 'View AST Worksheet',
              onClick: () => onViewDetails(row.astId),
              permission: Permission.VIEW_SPECIMENS,
            },
          ]}
          align="right"
        />
      ),
    },
  ], [onViewDetails]);

  const activeChips = useMemo(() => {
    const list = [];
    if (statusFilter !== 'All') list.push({ key: 'status', label: 'Status', valueLabel: statusFilter });
    return list;
  }, [statusFilter]);

  const densityClass = density === 'high-density' ? 'density-high' : density === 'compact' ? 'density-compact' : 'density-comfortable';

  const extraFiltersBlock = (
    <select
      value={statusFilter}
      onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
      className="lims-input"
      style={{ height: '34px', padding: '0 6px', fontSize: '0.8rem' }}
    >
      <option value="All">All Statuses</option>
      <option value="Created">Created</option>
      <option value="Panel Assigned">Panel Assigned</option>
      <option value="In Testing">In Testing</option>
      <option value="Testing Completed">Testing Completed</option>
      <option value="Pending Technical Review">Pending Review</option>
      <option value="Approved">Approved</option>
      <option value="Rejected">Rejected</option>
      <option value="Returned For Correction">Returned For Correction</option>
    </select>
  );

  return (
    <PageContainer>
      <ModuleToolbar
        title="AST Susceptibility Worklist"
        subtitle="Antimicrobial Susceptibility Testing — CLSI / EUCAST Interpretation"
        searchValue={searchQuery}
        onSearchChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
        searchPlaceholder="Search AST ID, colony, organism..."
        filterItems={activeChips}
        onRemoveFilter={() => setStatusFilter('All')}
        onClearAllFilters={() => setStatusFilter('All')}
        onRefresh={fetchAsts}
        onCreate={canCreate ? onCreateAst : undefined}
        createLabel="New AST Record"
        extraFilters={extraFiltersBlock}
      />

      <ContentCard
        loading={loading}
        error={error}
        empty={!loading && asts.length === 0}
        emptyTitle="No AST Records Found"
        emptyDescription="No susceptibility testing records match the current criteria."
        onRetry={fetchAsts}
      >
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <DataTable columns={columns} data={asts} rowKey="astId" className={densityClass} />
        </div>
      </ContentCard>

      {!loading && !error && asts.length > 0 && (
        <div style={styles.footerBar}>
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
  guidelineBadge: {
    fontSize: '0.72rem',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: 'rgba(99,102,241,0.08)',
    color: '#6366f1',
    border: '1px solid rgba(99,102,241,0.2)',
  },
  statusBadge: {
    padding: '2px 8px',
    borderRadius: 'var(--radius-circular)',
    fontSize: '0.72rem',
    fontWeight: 600,
    border: '1px solid var(--color-border-default)',
    whiteSpace: 'nowrap',
  },
  sTag: {
    padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700,
    backgroundColor: 'rgba(34,197,94,0.1)', color: 'var(--color-status-success)',
  },
  iTag: {
    padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700,
    backgroundColor: 'rgba(245,158,11,0.1)', color: 'var(--color-status-warning)',
  },
  rTag: {
    padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700,
    backgroundColor: 'var(--color-status-danger-bg)', color: 'var(--color-status-danger)',
  },
  footerBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderTop: '1px solid var(--color-border-default)',
    paddingTop: 'var(--spacing-sm)',
    flexWrap: 'wrap', gap: 'var(--spacing-md)',
    width: '100%', boxSizing: 'border-box',
  },
};

export default AstList;
