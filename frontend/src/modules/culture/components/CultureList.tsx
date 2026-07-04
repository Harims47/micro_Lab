import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Culture } from '../models/types';
import { CultureService } from '../services/cultureService';
import { usePermission } from '../../../infrastructure/permissions/usePermission';
import { Permission } from '../../../infrastructure/permissions/constants';
import { useNotification } from '../../../infrastructure/notifications/useNotification';
import { useGlobalState } from '../../../providers/GlobalStateProvider';

import { PageContainer, ContentCard, ModuleToolbar } from '../../../components/Layout';
import { DataTable, type ColumnDef, ActionMenu, Pagination } from '../../../components/Data';

interface CultureListProps {
  onViewDetails: (id: string) => void;
  onInoculate: () => void;
}

export const CultureList: React.FC<CultureListProps> = ({
  onViewDetails,
  onInoculate,
}) => {
  const { hasPermission } = usePermission();
  const { addToast } = useNotification();
  const { addAuditLog, density } = useGlobalState();

  // Perms check
  const canInoculate = hasPermission(Permission.REGISTER_SPECIMEN); // mapped culture create

  // Directory state
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter params
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const sortBy = 'cultureAccession';
  const sortOrder = 'desc';

  const fetchCultures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await CultureService.getCultures({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        status: statusFilter === 'All' ? undefined : statusFilter,
        sortBy,
        sortOrder,
      });
      setCultures(res.cultures);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve culture plates list.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, statusFilter]);

  useEffect(() => {
    fetchCultures();
  }, [fetchCultures]);

  // Debounced search logs
  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        addAuditLog('Culture Search', 'Culture', 'Registry', `Searched cultures for query: "${searchQuery}"`);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, addAuditLog]);

  const handleStartIncubation = useCallback(async (cultureId: string, plateId: string) => {
    try {
      await CultureService.updatePlateStatus(cultureId, plateId, 'Incubating');
      addToast('success', 'Plate placed in incubator successfully.');
      addAuditLog('Start Incubation', 'Culture', cultureId, `Started incubation for plate ${plateId}`);
      fetchCultures();
    } catch {
      addToast('error', 'Failed to start plate incubation.');
    }
  }, [addToast, addAuditLog, fetchCultures]);

  const columns = useMemo<ColumnDef<Culture>[]>(() => {
    return [
      {
        key: 'cultureAccession',
        label: 'Culture ID',
        sortable: true,
        render: (row) => (
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.cultureAccession}</span>
        ),
      },
      {
        key: 'patientMrn',
        label: 'MRN ID',
        sortable: true,
        render: (row) => (
          <span style={{ fontFamily: 'var(--font-mono)' }}>{row.patientMrn}</span>
        ),
      },
      {
        key: 'patientName',
        label: 'Patient Name',
        sortable: true,
      },
      {
        key: 'specimenBarcode',
        label: 'Specimen Barcode',
        sortable: true,
        render: (row) => (
          <span style={{ fontFamily: 'var(--font-mono)' }}>{row.specimenBarcode}</span>
        ),
      },
      {
        key: 'plates',
        label: 'Media Plates',
        render: (row) => {
          const list = row.plates.map((p) => p.mediaName);
          return <span>{list.join(', ')} ({row.plates.length})</span>;
        },
      },
      {
        key: 'incubator',
        label: 'Placement',
        render: (row) => {
          const inc = row.plates.map((p) => p.incubation.incubatorId);
          return <span>{Array.from(new Set(inc)).join(', ') || 'Unassigned'}</span>;
        },
      },
      {
        key: 'status',
        label: 'Workflow Status',
        sortable: true,
        render: (row) => {
          const isContam = row.status === 'Contaminated';
          const isGrowth = row.status === 'Growth Detected';
          const bg = isContam
            ? 'var(--color-status-danger-bg)'
            : isGrowth
            ? 'var(--color-status-success-bg)'
            : 'var(--color-brand-secondary-bg)';
          const color = isContam
            ? 'var(--color-status-danger)'
            : isGrowth
            ? 'var(--color-status-success)'
            : 'var(--color-brand-primary)';

          return (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-circular)',
                fontSize: '0.72rem',
                fontWeight: 600,
                backgroundColor: bg,
                color,
              }}
            >
              {row.status}
            </span>
          );
        },
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (row) => {
          const items = [
            {
              label: 'View Culture Profile',
              onClick: () => onViewDetails(row.cultureId),
              permission: Permission.VIEW_SPECIMENS,
            },
          ];

          // Offer quick incubation option if any plate is inoculate but unincubated
          row.plates.forEach((p) => {
            if (p.status === 'Created') {
              items.push({
                label: `Start Incubation: ${p.mediaName}`,
                onClick: () => handleStartIncubation(row.cultureId, p.plateId),
                permission: Permission.INOCULATE_PLATE,
              });
            }
          });

          return <ActionMenu items={items} align="right" />;
        },
      },
    ];
  }, [onViewDetails, handleStartIncubation]);

  const activeChips = useMemo(() => {
    const list = [];
    if (statusFilter !== 'All') {
      list.push({ key: 'status', label: 'Status', valueLabel: statusFilter });
    }
    return list;
  }, [statusFilter]);

  const densityClass = useMemo(() => {
    if (density === 'high-density') return 'density-high';
    if (density === 'compact') return 'density-compact';
    return 'density-comfortable';
  }, [density]);

  const totalPages = Math.ceil(total / pageSize);

  const extraFiltersBlock = (
    <div style={styles.filtersWrapper}>
      <div style={styles.statusFilters}>
        {['All', 'Incubating', 'Growth Detected', 'No Growth', 'Contaminated'].map((s) => (
          <button
            key={s}
            style={statusFilter === s ? styles.tabActive : styles.tab}
            onClick={() => {
              setStatusFilter(s);
              setCurrentPage(1);
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <PageContainer>
      {/* Controls Toolbar */}
      <ModuleToolbar
        title="Microbiology Cultures"
        subtitle="Microbiology Growth Registry and Incubation Workstation"
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search culture accession, plate ID, MRN, patient..."
        filterItems={activeChips}
        onRemoveFilter={(key) => key === 'status' && setStatusFilter('All')}
        onClearAllFilters={() => setStatusFilter('All')}
        onRefresh={fetchCultures}
        onCreate={canInoculate ? onInoculate : undefined}
        createLabel="Start Culture"
        extraFilters={extraFiltersBlock}
      />

      {/* Culture list table */}
      <ContentCard
        loading={loading}
        error={error}
        empty={!loading && cultures.length === 0}
        emptyTitle="No Cultures Registered"
        emptyDescription="There are no microbiology cultures matching search query."
        onRetry={fetchCultures}
      >
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <DataTable
            columns={columns}
            data={cultures}
            rowKey="cultureId"
            className={densityClass}
          />
        </div>
      </ContentCard>

      {/* Pagination */}
      {!loading && !error && cultures.length > 0 && (
        <div style={styles.footerBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <span style={{ font: 'var(--type-body-small)', color: 'var(--color-text-secondary)' }}>
              Showing {Math.min(total, (currentPage - 1) * pageSize + 1)}–{Math.min(total, currentPage * pageSize)} of {total}
            </span>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
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
    gap: 'var(--spacing-xs)',
    flexWrap: 'wrap',
  },
  statusFilters: {
    display: 'flex',
    backgroundColor: 'var(--color-surface-base)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-sm)',
    padding: '2px',
  },
  tab: {
    padding: '6px 14px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    font: 'var(--type-label-default)',
    color: 'var(--color-text-secondary)',
    borderRadius: 'var(--radius-xs)',
  },
  tabActive: {
    padding: '6px 14px',
    border: 'none',
    cursor: 'pointer',
    font: 'var(--type-label-default)',
    color: 'var(--color-brand-primary)',
    backgroundColor: 'var(--color-surface-raised)',
    borderRadius: 'var(--radius-xs)',
    boxShadow: 'var(--elevation-1)',
    fontWeight: 600,
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
export default CultureList;
