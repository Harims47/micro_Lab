import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { LaboratoryReport } from '../models/types';
import { ReportService } from '../services/reportService';
import { Permission } from '../../../infrastructure/permissions/constants';
import { useGlobalState } from '../../../providers/GlobalStateProvider';

import { PageContainer, ContentCard, ModuleToolbar } from '../../../components/Layout';
import { DataTable, type ColumnDef, ActionMenu, Pagination } from '../../../components/Data';

interface ReportListProps {
  onViewDetails: (id: string) => void;
}

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  'Draft':             { bg: 'var(--color-surface-base)',           text: 'var(--color-text-secondary)' },
  'Generated':         { bg: 'rgba(99,102,241,0.08)',               text: '#6366f1' },
  'Pending Signature': { bg: 'rgba(245,158,11,0.08)',               text: 'var(--color-status-warning)' },
  'Ready For Release': { bg: 'rgba(234,88,12,0.08)',               text: 'orange' },
  'Released':          { bg: 'var(--color-status-success-bg)',      text: 'var(--color-status-success)' },
  'Amended':           { bg: 'rgba(124,58,237,0.08)',              text: '#7c3aed' },
  'Archived':          { bg: 'rgba(161,0,0,0.06)',                  text: 'crimson' },
};

export const ReportList: React.FC<ReportListProps> = ({ onViewDetails }) => {
  const { density } = useGlobalState();

  const [reports, setReports] = useState<LaboratoryReport[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ReportService.getReports({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        status: statusFilter === 'All' ? undefined : statusFilter,
      });
      setReports(res.reports);
      setTotal(res.total);
    } catch (e: any) {
      setError(e.message || 'Failed to load report worklist.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const columns = useMemo<ColumnDef<LaboratoryReport>[]>(() => [
    {
      key: 'reportId', label: 'Report ID', sortable: true,
      render: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.reportId}</span>,
    },
    {
      key: 'patient', label: 'Patient Name', sortable: true,
      render: (r) => <span>{r.approvedResult.patientName}</span>,
    },
    {
      key: 'organism', label: 'Organism', sortable: true,
      render: (r) => <strong style={{ fontSize: '0.82rem' }}>{r.approvedResult.organismName}</strong>,
    },
    {
      key: 'version', label: 'Current Version',
      render: (r) => <span style={styles.versionBadge}>{r.version}</span>,
    },
    {
      key: 'releasedBy', label: 'Released By',
      render: (r) => {
        const releasedVer = r.versionHistory.find((v) => v.isActive && v.releasedBy);
        return <span>{releasedVer?.releasedBy ?? '—'}</span>;
      },
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
      key: 'actions', label: 'Actions',
      render: (r) => (
        <ActionMenu
          items={[{ label: 'Generate Report', onClick: () => onViewDetails(r.reportId), permission: Permission.VIEW_SPECIMENS }]}
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

  const extraFilters = (
    <select
      value={statusFilter}
      onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
      className="lims-input"
      style={{ height: '34px', padding: '0 6px', fontSize: '0.8rem' }}
    >
      <option value="All">All Statuses</option>
      <option value="Draft">Draft</option>
      <option value="Generated">Generated</option>
      <option value="Pending Signature">Pending Signature</option>
      <option value="Ready For Release">Ready For Release</option>
      <option value="Released">Released</option>
      <option value="Amended">Amended</option>
      <option value="Archived">Archived</option>
    </select>
  );

  const densityClass = density === 'high-density' ? 'density-high' : density === 'compact' ? 'density-compact' : 'density-comfortable';

  return (
    <PageContainer>
      <ModuleToolbar
        title="Report Worklist"
        subtitle="Controlled Clinical Report Delivery & Electronic Signature Verification"
        searchValue={searchQuery}
        onSearchChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
        searchPlaceholder="Search Report ID, patient, organism..."
        filterItems={activeChips}
        onRemoveFilter={() => setStatusFilter('All')}
        onClearAllFilters={() => setStatusFilter('All')}
        onRefresh={fetchReports}
        onCreate={reports.length > 0 ? () => onViewDetails(reports[0].reportId) : undefined}
        createLabel="Generate Report"
        extraFilters={extraFilters}
      />

      <ContentCard
        loading={loading} error={error}
        empty={!loading && reports.length === 0}
        emptyTitle="No Reports Found"
        emptyDescription="No reports match your current filtering criteria."
        onRetry={fetchReports}
      >
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <DataTable columns={columns} data={reports} rowKey="reportId" className={densityClass} />
        </div>
      </ContentCard>

      {!loading && !error && reports.length > 0 && (
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
  versionBadge: {
    fontSize: '0.72rem', fontWeight: 600,
    padding: '2px 8px', borderRadius: '4px',
    backgroundColor: 'rgba(99,102,241,0.08)', color: '#6366f1',
    border: '1px solid rgba(99,102,241,0.2)',
  },
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

export default ReportList;
