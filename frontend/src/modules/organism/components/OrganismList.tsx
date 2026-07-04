import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Colony } from '../models/types';
import { OrganismService } from '../services/organismService';
import { usePermission } from '../../../infrastructure/permissions/usePermission';
import { Permission } from '../../../infrastructure/permissions/constants';
import { useNotification } from '../../../infrastructure/notifications/useNotification';
import { useGlobalState } from '../../../providers/GlobalStateProvider';

import { PageContainer, ContentCard, ModuleToolbar } from '../../../components/Layout';
import { DataTable, type ColumnDef, ActionMenu, Pagination } from '../../../components/Data';

interface OrganismListProps {
  onViewDetails: (id: string) => void;
  onStartIdentification: () => void;
}

export const OrganismList: React.FC<OrganismListProps> = ({
  onViewDetails,
  onStartIdentification,
}) => {
  const { hasPermission } = usePermission();
  const { addToast } = useNotification();
  const { addAuditLog, density } = useGlobalState();

  const canCreate = hasPermission(Permission.REGISTER_SPECIMEN); // mapped organism create
  const canReview = hasPermission(Permission.VALIDATE_TECHNICAL); // mapped ID approval

  // Directory state
  const [colonies, setColonies] = useState<Colony[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [qcFilter, setQcFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchColonies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await OrganismService.getColonies({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        status: statusFilter === 'All' ? undefined : statusFilter,
        qcStatus: qcFilter === 'All' ? undefined : qcFilter,
      });
      setColonies(res.colonies);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve isolated colonies list.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter, qcFilter]);

  useEffect(() => {
    fetchColonies();
  }, [fetchColonies]);

  const handleSendToAST = useCallback(async (colonyId: string) => {
    try {
      await OrganismService.sendToAstQueue(colonyId);
      addToast('success', 'Colony successfully enqueued to AST Testing workstation.');
      addAuditLog('AST Requested', 'Colony', colonyId, 'Enqueued colony for drug susceptibility AST panel.');
      fetchColonies();
    } catch {
      addToast('error', 'Failed to request AST panels.');
    }
  }, [addToast, addAuditLog, fetchColonies]);

  const columns = useMemo<ColumnDef<Colony>[]>(() => {
    return [
      {
        key: 'colonyId',
        label: 'Colony ID',
        sortable: true,
        render: (row) => (
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.colonyId}</span>
        ),
      },
      {
        key: 'plateBarcode',
        label: 'Plate Barcode',
        sortable: true,
        render: (row) => (
          <span style={{ fontFamily: 'var(--font-mono)' }}>{row.plateBarcode}</span>
        ),
      },
      {
        key: 'cultureAccession',
        label: 'Culture ID',
        sortable: true,
        render: (row) => (
          <span style={{ fontFamily: 'var(--font-mono)' }}>{row.cultureAccession}</span>
        ),
      },
      {
        key: 'gramStain',
        label: 'Gram Stain',
        render: (row) => {
          if (!row.gramStain) return <span>—</span>;
          const isPos = row.gramStain.reaction === 'Gram Positive';
          return (
            <span style={{ color: isPos ? 'purple' : '#e67e22', fontWeight: 'bold' }}>
              {row.gramStain.reaction} ({row.gramStain.shape})
            </span>
          );
        },
      },
      {
        key: 'organism',
        label: 'Taxon Identification',
        render: (row) => {
          if (row.approvedAttempt) {
            return <strong>{row.approvedAttempt.organismName}</strong>;
          }
          if (row.attempts.length > 0) {
            return <span>Latest: {row.attempts[row.attempts.length - 1].organismName} (Draft)</span>;
          }
          return <span style={{ color: 'gray' }}>No candidates</span>;
        },
      },
      {
        key: 'status',
        label: 'Lifecycle Status',
        sortable: true,
        render: (row) => (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-circular)',
              fontSize: '0.72rem',
              fontWeight: 600,
              backgroundColor: row.status === 'Sent to AST' ? 'var(--color-status-success-bg)' : 'var(--color-brand-secondary-bg)',
              color: row.status === 'Sent to AST' ? 'var(--color-status-success)' : 'var(--color-brand-primary)',
            }}
          >
            {row.status}
          </span>
        ),
      },
      {
        key: 'qcStatus',
        label: 'QC Status',
        sortable: true,
        render: (row) => {
          const isVerified = row.qcStatus === 'QC Verified';
          const isFailed = row.qcStatus === 'QC Failed';
          return (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-circular)',
                fontSize: '0.72rem',
                fontWeight: 600,
                backgroundColor: isVerified
                  ? 'rgba(0,128,0,0.05)'
                  : isFailed
                  ? 'var(--color-status-danger-bg)'
                  : 'transparent',
                color: isVerified ? 'green' : isFailed ? 'var(--color-status-danger)' : 'var(--color-text-secondary)',
                border: '1px solid var(--color-border-default)'
              }}
            >
              {row.qcStatus}
            </span>
          );
        },
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (row) => {
          const items: any[] = [
            {
              label: 'Identify Organism',
              onClick: () => onViewDetails(row.colonyId),
              permission: Permission.VIEW_SPECIMENS,
            },
          ];

          if (row.status === 'Identified' && canReview) {
            items.push({
              label: 'Enqueue to AST susceptibility',
              onClick: () => handleSendToAST(row.colonyId),
              permission: Permission.RECORD_AST_RESULT,
            });
          }

          return <ActionMenu items={items} align="right" />;
        },
      },
    ];
  }, [onViewDetails, canReview, handleSendToAST]);

  const activeChips = useMemo(() => {
    const list = [];
    if (statusFilter !== 'All') {
      list.push({ key: 'status', label: 'Status', valueLabel: statusFilter });
    }
    if (qcFilter !== 'All') {
      list.push({ key: 'qcStatus', label: 'QC', valueLabel: qcFilter });
    }
    return list;
  }, [statusFilter, qcFilter]);

  const densityClass = useMemo(() => {
    if (density === 'high-density') return 'density-high';
    if (density === 'compact') return 'density-compact';
    return 'density-comfortable';
  }, [density]);

  const extraFiltersBlock = (
    <div style={styles.filtersWrapper}>
      <select
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value);
          setCurrentPage(1);
        }}
        className="lims-input"
        style={styles.select}
      >
        <option value="All">All Statuses</option>
        <option value="Observed">Observed</option>
        <option value="Under Identification">Under Identification</option>
        <option value="Identified">Identified</option>
        <option value="Sent to AST">Sent to AST</option>
      </select>

      <select
        value={qcFilter}
        onChange={(e) => {
          setQcFilter(e.target.value);
          setCurrentPage(1);
        }}
        className="lims-input"
        style={styles.select}
      >
        <option value="All">All QC Statuses</option>
        <option value="Pending QC">Pending QC</option>
        <option value="QC Verified">QC Verified</option>
        <option value="QC Failed">QC Failed</option>
      </select>
    </div>
  );

  return (
    <PageContainer>
      <ModuleToolbar
        title="Colony Analysis & Identifications"
        subtitle="Clinical Taxonomic Identifications and Gram Stain Registry"
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search colony, plate, culture accession, organism..."
        filterItems={activeChips}
        onRemoveFilter={(key) => {
          if (key === 'status') setStatusFilter('All');
          if (key === 'qcStatus') setQcFilter('All');
        }}
        onClearAllFilters={() => {
          setStatusFilter('All');
          setQcFilter('All');
        }}
        onRefresh={fetchColonies}
        onCreate={canCreate ? onStartIdentification : undefined}
        createLabel="Identify Organism"
        extraFilters={extraFiltersBlock}
      />

      <ContentCard
        loading={loading}
        error={error}
        empty={!loading && colonies.length === 0}
        emptyTitle="No Colonies Found"
        emptyDescription="There are no isolated colony records matching criteria."
        onRetry={fetchColonies}
      >
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <DataTable
            columns={columns}
            data={colonies}
            rowKey="colonyId"
            className={densityClass}
          />
        </div>
      </ContentCard>

      {!loading && !error && colonies.length > 0 && (
        <div style={styles.footerBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <span style={{ font: 'var(--type-body-small)', color: 'var(--color-text-secondary)' }}>
              Showing {Math.min(total, (currentPage - 1) * pageSize + 1)}–{Math.min(total, currentPage * pageSize)} of {total}
            </span>
          </div>

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
  filtersWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  select: {
    height: '34px',
    padding: '0 6px',
    fontSize: '0.8rem',
  },
  footerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--color-border-default)',
    paddingTop: 'var(--spacing-sm)',
    flexWrap: 'wrap',
    gap: 'var(--spacing-md)',
    width: '100%',
    boxSizing: 'border-box',
  },
};
export default OrganismList;
