import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Specimen } from '../models/types';
import { REJECTION_CATEGORIES } from '../models/types';
import { SpecimenService } from '../services/specimenService';
import { usePermission } from '../../../infrastructure/permissions/usePermission';
import { Permission } from '../../../infrastructure/permissions/constants';
import { useNotification } from '../../../infrastructure/notifications/useNotification';
import { useGlobalState } from '../../../providers/GlobalStateProvider';


import { PageContainer, ContentCard, ModuleToolbar, Card } from '../../../components/Layout';
import { DataTable, type ColumnDef, KpiCard, ActionMenu, Pagination } from '../../../components/Data';
import { Button } from '../../../components/Foundation/Button';
import { TextInput } from '../../../components/Form/TextInput';
import { SlidersHorizontal } from 'lucide-react';

interface SpecimenListProps {
  onViewDetails: (id: string) => void;
  onCollectSpecimen: () => void;
}

export const SpecimenList: React.FC<SpecimenListProps> = ({
  onViewDetails,
  onCollectSpecimen,
}) => {
  const { hasPermission } = usePermission();
  const { addToast } = useNotification();
  const { addAuditLog, density } = useGlobalState();

  // Perms check
  const canCollect = hasPermission(Permission.REGISTER_SPECIMEN);
  const canReceive = hasPermission(Permission.RECEIVE_SPECIMEN);
  const canReject = hasPermission(Permission.REJECT_SPECIMEN);
  const canPrint = hasPermission(Permission.ORDER_PRINT);

  // Directory states
  const [specimens, setSpecimens] = useState<Specimen[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Queries filter parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const sortBy = 'collectionDetails.timestamp';
  const sortOrder = 'desc';

  // Advanced search states
  const [advOpen, setAdvOpen] = useState(false);
  const [advContainer, setAdvContainer] = useState('');
  const [advCollector, setAdvCollector] = useState('');

  // Structured Rejection Drawer Bulk state
  const [showRejectDrawer, setShowRejectDrawer] = useState(false);
  const [rejectCategory, setRejectCategory] = useState<string>(REJECTION_CATEGORIES[0]);
  const [rejectReason, setRejectReason] = useState('');

  // Bulk selection
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // ─── Fetch Registry data ──────────────────────────────────────────────────
  const fetchSpecimens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await SpecimenService.getSpecimens({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        status: statusFilter === 'All' ? undefined : statusFilter,
        container: advOpen && advContainer ? advContainer : undefined,
        collector: advOpen && advCollector ? advCollector : undefined,
        sortBy,
        sortOrder,
      });
      setSpecimens(res.specimens);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve specimen registry index.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, statusFilter, advOpen, advContainer, advCollector]);

  useEffect(() => {
    fetchSpecimens();
  }, [fetchSpecimens]);

  // Debounced search logs
  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        addAuditLog('Specimen Search', 'Specimen', 'Registry', `Searched for specimens matching: "${searchQuery}"`);
        setRecentSearches((prev) => {
          const updated = [searchQuery, ...prev.filter((s) => s !== searchQuery)].slice(0, 3);
          return updated;
        });
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, addAuditLog]);

  // ─── Specimen Actions ──────────────────────────────────────────────────────
  const handleBulkReceive = async () => {
    if (selectedKeys.length === 0) return;
    try {
      await SpecimenService.bulkReceiveSpecimens(selectedKeys);
      addToast('success', `Bulk received ${selectedKeys.length} specimen container tubes.`);
      addAuditLog('Bulk Specimen Receive', 'Specimen', 'Bulk', `Received keys: ${selectedKeys.join(', ')}`);
      setSelectedKeys([]);
      fetchSpecimens();
    } catch {
      addToast('error', 'Bulk receiving encountered issues.');
    }
  };

  const handleBulkAccept = async () => {
    if (selectedKeys.length === 0) return;
    try {
      await SpecimenService.bulkAcceptSpecimens(selectedKeys);
      addToast('success', `Bulk accepted ${selectedKeys.length} specimens for inoculation.`);
      addAuditLog('Bulk Specimen Accept', 'Specimen', 'Bulk', `Accepted keys: ${selectedKeys.join(', ')}`);
      setSelectedKeys([]);
      fetchSpecimens();
    } catch {
      addToast('error', 'Bulk acceptance failed.');
    }
  };

  const handleBulkRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedKeys.length === 0) return;
    try {
      await SpecimenService.bulkRejectSpecimens(selectedKeys, rejectReason, rejectCategory);
      addToast('success', `Bulk rejected ${selectedKeys.length} specimens: ${rejectCategory}.`);
      addAuditLog('Bulk Specimen Reject', 'Specimen', 'Bulk', `Rejected keys: ${selectedKeys.join(', ')}. Category: ${rejectCategory}`);
      setSelectedKeys([]);
      setShowRejectDrawer(false);
      setRejectReason('');
      fetchSpecimens();
    } catch {
      addToast('error', 'Bulk rejection failed.');
    }
  };

  const handleReprintLabels = useCallback(async (id: string, barcode: string) => {
    try {
      await SpecimenService.reprintBarcode(id, 'User manual label reprint.');
      addToast('success', `Barcode reprint job dispatched for specimen [${barcode}].`);
      addAuditLog('Specimen Label Reprint', 'Specimen', id, `Reprinted barcode label for ${barcode}`);
    } catch {
      addToast('error', 'Label reprint failed.');
    }
  }, [addToast, addAuditLog]);

  // ─── Column Map ────────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<Specimen>[]>(() => {
    return [
      {
        key: 'barcode',
        label: 'Barcode ID',
        sortable: true,
        render: (row) => (
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.barcode}</span>
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
        key: 'testName',
        label: 'Test Investigation',
        sortable: true,
      },
      {
        key: 'containerType',
        label: 'Container',
        sortable: true,
      },
      {
        key: 'volume',
        label: 'Volume',
        render: (row) => `${row.volume} mL/Swab`,
      },
      {
        key: 'status',
        label: 'Custody Status',
        sortable: true,
        render: (row) => {
          const isActive = ['Collected', 'Received', 'Under Quality Check'].includes(row.status);
          const isAccepted = row.status === 'Accepted';
          const bg = isAccepted
            ? 'var(--color-status-success-bg)'
            : isActive
            ? 'var(--color-brand-secondary-bg)'
            : 'var(--color-status-danger-bg)';
          const color = isAccepted
            ? 'var(--color-status-success)'
            : isActive
            ? 'var(--color-brand-primary)'
            : 'var(--color-status-danger)';

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
        key: 'collectionTime',
        label: 'Collection Date',
        sortable: true,
        render: (row) => new Date(row.collectionDetails.timestamp).toLocaleDateString(),
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (row) => {
          const items = [
            {
              label: 'View Specimen Details',
              onClick: () => onViewDetails(row.specimenId),
              permission: Permission.VIEW_SPECIMENS,
            },
            {
              label: 'Reprint Barcode Label',
              onClick: () => handleReprintLabels(row.specimenId, row.barcode),
              permission: Permission.ORDER_PRINT,
            },
          ];
          return <ActionMenu items={items} align="right" />;
        },
      },
    ];
  }, [onViewDetails, handleReprintLabels]);

  // Seeding dynamic count variables for KPI summary bar
  const kpiItems = useMemo(() => {
    const totalCount = total;
    const collectedCount = specimens.filter((s) => s.status === 'Collected').length;
    const receivedCount = specimens.filter((s) => s.status === 'Received').length;
    const rejectedCount = specimens.filter((s) => s.status === 'Rejected').length;
    const splitCount = specimens.filter((s) => s.parentId).length;

    return [
      { id: 'total', title: 'Total Specimens', value: totalCount, indicatorColor: 'var(--color-brand-primary)' },
      { id: 'collected', title: 'Collected', value: collectedCount, indicatorColor: 'var(--color-brand-secondary)' },
      { id: 'received', title: 'Received Today', value: receivedCount, indicatorColor: 'var(--color-status-success)' },
      { id: 'rejected', title: 'Rejected Today', value: rejectedCount, indicatorColor: 'var(--color-status-danger)' },
      { id: 'split', title: 'Aliquots Split', value: splitCount, indicatorColor: '#8b0000' },
    ];
  }, [specimens, total]);

  const activeChips = useMemo(() => {
    const list = [];
    if (statusFilter !== 'All') {
      list.push({ key: 'status', label: 'Status', valueLabel: statusFilter });
    }
    if (advOpen) {
      if (advContainer) list.push({ key: 'container', label: 'Container', valueLabel: advContainer });
      if (advCollector) list.push({ key: 'collector', label: 'Collector', valueLabel: advCollector });
    }
    return list;
  }, [statusFilter, advOpen, advContainer, advCollector]);

  const handleRemoveChip = (key: string) => {
    if (key === 'status') setStatusFilter('All');
    else {
      if (key === 'container') setAdvContainer('');
      if (key === 'collector') setAdvCollector('');
    }
  };

  const handleClearAllChips = () => {
    setStatusFilter('All');
    setAdvContainer('');
    setAdvCollector('');
  };

  const densityClass = useMemo(() => {
    if (density === 'high-density') return 'density-high';
    if (density === 'compact') return 'density-compact';
    return 'density-comfortable';
  }, [density]);

  const totalPages = Math.ceil(total / pageSize);

  const extraFiltersBlock = (
    <div style={styles.filtersWrapper}>
      <div style={styles.statusFilters}>
        {['All', 'Collected', 'Received', 'Accepted', 'Rejected'].map((s) => (
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

      <button
        onClick={() => setAdvOpen(!advOpen)}
        style={{
          ...styles.iconToggleBtn,
          backgroundColor: advOpen ? 'var(--color-brand-secondary-bg)' : 'transparent',
        }}
      >
        <SlidersHorizontal size={16} />
        <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Advanced</span>
      </button>
    </div>
  );

  return (
    <PageContainer>
      {/* 1. KPIs Grid */}
      <div style={styles.kpiGrid}>
        {kpiItems.map((item) => (
          <KpiCard
            key={item.id}
            title={item.title}
            value={item.value}
            indicatorColor={item.indicatorColor}
          />
        ))}
      </div>

      {/* 2. Controls Toolbar */}
      <ModuleToolbar
        title="Specimens"
        subtitle="Microbiology Specimen Lifecycle Directory"
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search barcode, Patient MRN, test, container..."
        filterItems={activeChips}
        onRemoveFilter={handleRemoveChip}
        onClearAllFilters={handleClearAllChips}
        onRefresh={fetchSpecimens}
        onExport={handleExport}
        onCreate={canCollect ? onCollectSpecimen : undefined}
        createLabel="Accession Specimen"
        extraFilters={extraFiltersBlock}
      />

      {/* Recent queries */}
      {recentSearches.length > 0 && (
        <div style={styles.recentSearchesBar}>
          <span>Recent Queries:</span>
          {recentSearches.map((s, idx) => (
            <span
              key={idx}
              onClick={() => setSearchQuery(s)}
              style={styles.recentQueryTag}
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* 3. Advanced parameters */}
      {advOpen && (
        <div style={styles.advSearchPanel}>
          <h4 style={{ margin: '0 0 var(--spacing-sm) 0', font: 'var(--type-heading-item)' }}>Advanced Search Parameters</h4>
          <div style={styles.advGrid}>
            <TextInput
              label="Container Type"
              value={advContainer}
              onChange={(e) => setAdvContainer(e.target.value)}
              placeholder="e.g. Sterile Cup, Bottle"
            />
            <TextInput
              label="Collector Staff"
              value={advCollector}
              onChange={(e) => setAdvCollector(e.target.value)}
              placeholder="e.g. Sarah Connor"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-sm)' }}>
            <Button
              variant="outline"
              onClick={() => {
                setAdvContainer('');
                setAdvCollector('');
                fetchSpecimens();
              }}
            >
              Clear Filters
            </Button>
            <Button variant="solid" onClick={fetchSpecimens}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {/* Bulk actions drawer */}
      {selectedKeys.length > 0 && (
        <div style={styles.bulkActionBar}>
          <span>Selected: <strong>{selectedKeys.length}</strong> containers</span>
          <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
            {canReceive && (
              <Button variant="outline" onClick={handleBulkReceive}>
                Bulk Receive
              </Button>
            )}
            {canReceive && (
              <Button variant="outline" onClick={handleBulkAccept}>
                Bulk Accept
              </Button>
            )}
            {canReject && (
              <Button variant="outline" onClick={() => setShowRejectDrawer(true)} style={{ color: 'var(--color-status-danger)' }}>
                Bulk Reject
              </Button>
            )}
            {canPrint && (
              <Button variant="outline" onClick={handlePrintLabels}>
                Print Labels
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Structured Rejection Modal Drawer */}
      {showRejectDrawer && (
        <div style={styles.rejectionDrawerOverlay}>
          <Card style={styles.rejectionDrawer}>
            <h4 style={{ margin: '0 0 var(--spacing-sm) 0', font: 'var(--type-heading-item)' }}>Bulk Specimen Rejection Checklist</h4>
            <form onSubmit={handleBulkRejectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div>
                <label className="lims-form-label" style={{ display: 'block', marginBottom: '6px' }}>Rejection Category</label>
                <select
                  value={rejectCategory}
                  onChange={(e) => setRejectCategory(e.target.value)}
                  className="lims-input"
                  style={{ width: '100%', height: '36px' }}
                >
                  {REJECTION_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="lims-form-label" style={{ display: 'block', marginBottom: '6px' }}>Rejection notes / details</label>
                <textarea
                  className="lims-input"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Detail why the specimen has been rejected..."
                  style={{ width: '100%', height: '80px', padding: '8px', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <Button variant="outline" onClick={() => setShowRejectDrawer(false)}>Cancel</Button>
                <Button variant="solid" type="submit" style={{ backgroundColor: 'var(--color-status-danger)', color: 'white' }}>
                  Submit Rejection
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 4. Directory Grid */}
      <ContentCard
        loading={loading}
        error={error}
        empty={!loading && specimens.length === 0}
        emptyTitle="No Specimens Found"
        emptyDescription="There are no specimen collections matches current query."
        onRetry={fetchSpecimens}
      >
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <DataTable
            columns={columns}
            data={specimens}
            rowKey="specimenId"
            selectable
            selectedKeys={selectedKeys}
            onSelectKeys={setSelectedKeys}
            className={densityClass}
          />
        </div>
      </ContentCard>

      {/* 5. Pagination */}
      {!loading && !error && specimens.length > 0 && (
        <div style={styles.footerBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
            <span style={{ font: 'var(--type-body-small)', color: 'var(--color-text-secondary)' }}>
              Showing {Math.min(total, (currentPage - 1) * pageSize + 1)}–{Math.min(total, currentPage * pageSize)} of {total}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ font: 'var(--type-body-small)', color: 'var(--color-text-secondary)' }}>Rows</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="lims-input"
                style={styles.rowsSelector}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
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

const handleExport = () => {
  alert('Export functionality generated.');
};

const handlePrintLabels = () => {
  alert('Print labels queued.');
};

const styles: Record<string, React.CSSProperties> = {
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--spacing-md)',
  },
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
  iconToggleBtn: {
    height: '36px',
    padding: '0 12px',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    color: 'var(--color-text-primary)',
    backgroundColor: 'transparent',
  },
  recentSearchesBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
    font: 'var(--type-body-small)',
    color: 'var(--color-text-secondary)',
    fontSize: '0.75rem',
  },
  recentQueryTag: {
    cursor: 'pointer',
    textDecoration: 'underline',
    color: 'var(--color-brand-primary)',
    fontWeight: 500,
  },
  advSearchPanel: {
    backgroundColor: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--spacing-md)',
    boxShadow: 'var(--elevation-1)',
  },
  advGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--spacing-md)',
  },
  bulkActionBar: {
    backgroundColor: 'var(--color-brand-secondary-bg)',
    border: '1px solid var(--color-brand-primary)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px var(--spacing-md)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    font: 'var(--type-body-default)',
    color: 'var(--color-brand-primary)',
  },
  rejectionDrawerOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
  },
  rejectionDrawer: {
    width: '400px',
    backgroundColor: 'var(--color-surface-raised)',
    padding: 'var(--spacing-lg)',
    boxShadow: 'var(--elevation-3)',
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
  rowsSelector: {
    width: '70px',
    height: '32px',
    padding: '4px 8px',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
};
export default SpecimenList;
