import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Order } from '../models/types';
import { TEST_CATALOG, type OrderPriority } from '../models/types';
import { OrderService } from '../services/orderService';
import { usePermission } from '../../../infrastructure/permissions/usePermission';
import { Permission } from '../../../infrastructure/permissions/constants';
import { useNotification } from '../../../infrastructure/notifications/useNotification';
import { useDialog } from '../../../infrastructure/dialogs/useDialog';
import { useGlobalState } from '../../../providers/GlobalStateProvider';

import { PageContainer, ContentCard, ModuleToolbar } from '../../../components/Layout';
import { DataTable, type ColumnDef, KpiCard, ActionMenu, Pagination } from '../../../components/Data';
import { Button } from '../../../components/Foundation/Button';
import { TextInput } from '../../../components/Form/TextInput';
import { SlidersHorizontal } from 'lucide-react';

interface OrderListProps {
  onViewDetails: (id: string) => void;
  onEditOrder: (id: string) => void;
  onCreateOrder: () => void;
}

export const OrderList: React.FC<OrderListProps> = ({
  onViewDetails,
  onEditOrder,
  onCreateOrder,
}) => {
  const { hasPermission } = usePermission();
  const { addToast } = useNotification();
  const { confirmDelete } = useDialog();
  const { addAuditLog, density } = useGlobalState();

  // Permission tokens
  const canCreate = hasPermission(Permission.ORDER_CREATE);
  const canEdit = hasPermission(Permission.ORDER_EDIT);
  const canCancel = hasPermission(Permission.ORDER_CANCEL);
  const canExport = hasPermission(Permission.ORDER_EXPORT);
  const canPrint = hasPermission(Permission.ORDER_PRINT);

  // States
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const sortBy = 'createdAt';
  const sortOrder = 'desc';

  // Advanced search
  const [advOpen, setAdvOpen] = useState(false);
  const [advPhysician, setAdvPhysician] = useState('');
  const [advInvestigation, setAdvInvestigation] = useState('');

  // Selection
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // ─── Fetch Registry ─────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await OrderService.getOrders({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        status: statusFilter === 'All' ? undefined : statusFilter,
        priority: priorityFilter === 'All' ? undefined : priorityFilter,
        physician: advOpen && advPhysician ? advPhysician : undefined,
        investigation: advOpen && advInvestigation ? advInvestigation : undefined,
        sortBy,
        sortOrder,
      });
      setOrders(res.orders);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch requisitions directory.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, statusFilter, priorityFilter, advOpen, advPhysician, advInvestigation]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Debounced auditing
  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        addAuditLog('Order Search', 'Order', 'Registry', `Searched for orders matching: "${searchQuery}"`);
        setRecentSearches((prev) => {
          const updated = [searchQuery, ...prev.filter((s) => s !== searchQuery)].slice(0, 3);
          return updated;
        });
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, addAuditLog]);

  // ─── Requisition Actions ───────────────────────────────────────────────────
  const handleCancel = useCallback(async (id: string, accession: string) => {
    if (!canCancel) {
      addToast('error', 'ERR-403: Authorization denied to cancel orders.');
      return;
    }

    const confirmed = await confirmDelete({
      title: 'Cancel Order Requisition',
      message: `Cancel order requisition [${accession}]? This marks it as Cancelled in the workflow lifecycle.`,
    });

    if (!confirmed) return;

    try {
      await OrderService.cancelOrder(id, 'User manual cancellation request.');
      addToast('success', 'Order requisition has been cancelled.');
      addAuditLog('Order Cancel', 'Order', id, `Cancelled order requisition ${accession}`);
      fetchOrders();
    } catch (err: any) {
      addToast('error', err.message || 'Cancellation operation failed.');
    }
  }, [canCancel, confirmDelete, addToast, addAuditLog, fetchOrders]);

  const handleBulkCancel = async () => {
    if (selectedKeys.length === 0) return;
    const confirmed = await confirmDelete({
      title: 'Bulk Cancel Order Requisitions',
      message: `Cancel the ${selectedKeys.length} selected orders?`,
    });
    if (!confirmed) return;

    try {
      await OrderService.bulkUpdateOrders(selectedKeys, { status: 'Cancelled' });
      addToast('success', `Bulk cancelled ${selectedKeys.length} requisitions.`);
      addAuditLog('Bulk Cancel', 'Order', 'Bulk', `Cancelled order keys: ${selectedKeys.join(', ')}`);
      setSelectedKeys([]);
      fetchOrders();
    } catch (err: any) {
      addToast('error', err.message || 'Bulk cancellation encountered issues.');
    }
  };

  const handleBulkPriority = async (p: OrderPriority) => {
    if (selectedKeys.length === 0) return;
    try {
      await OrderService.bulkUpdateOrders(selectedKeys, { priority: p });
      addToast('success', `Updated priority to ${p} for ${selectedKeys.length} orders.`);
      addAuditLog('Bulk Priority Change', 'Order', 'Bulk', `Changed priority to ${p} on: ${selectedKeys.join(', ')}`);
      setSelectedKeys([]);
      fetchOrders();
    } catch (err: any) {
      addToast('error', err.message || 'Bulk priority updates failed.');
    }
  };

  const handlePrintLabels = () => {
    if (!canPrint) {
      addToast('error', 'ERR-403: Security permissions restrict printing order labels.');
      return;
    }
    const count = selectedKeys.length > 0 ? selectedKeys.length : total;
    addToast('success', `Dispatched barcode labels print job for ${count} specimens containers.`, 'Printer Service');
    addAuditLog('Order Labels Printed', 'Order', 'Print', `Printed barcode sheets for ${count} items.`);
  };

  const handleExport = () => {
    if (!canExport) {
      addToast('error', 'ERR-403: Export permissions restricted.');
      return;
    }
    const count = selectedKeys.length > 0 ? selectedKeys.length : total;
    addToast('success', `Export generated for ${count} order lines.`, 'Data Export');
    addAuditLog('Order Export', 'Order', 'Bulk', `Exported ${count} order rows.`);
  };

  // ─── Column Map ────────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<Order>[]>(() => {
    return [
      {
        key: 'accessionNumber',
        label: 'Accession ID',
        sortable: true,
        render: (row) => (
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.accessionNumber}</span>
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
        label: 'Patient Profile',
        sortable: true,
      },
      {
        key: 'requestedTests',
        label: 'Requested Tests',
        render: (row) => {
          return (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {row.requestedTests.map((code) => {
                const test = TEST_CATALOG.find((cat) => cat.code === code);
                return (
                  <span
                    key={code}
                    title={test?.name}
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 6px',
                      backgroundColor: 'var(--color-surface-base)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-xs)',
                      fontWeight: 500,
                    }}
                  >
                    {test ? test.name : code}
                  </span>
                );
              })}
            </div>
          );
        },
      },
      {
        key: 'priority',
        label: 'Priority',
        sortable: true,
        render: (row) => {
          const p = row.priority;
          const bg =
            p === 'STAT'
              ? 'var(--color-status-danger-bg)'
              : p === 'Emergency'
              ? '#8b000022'
              : p === 'Urgent'
              ? '#ffa50022'
              : 'var(--color-status-info-bg)';
          const color =
            p === 'STAT'
              ? 'var(--color-status-danger)'
              : p === 'Emergency'
              ? '#8b0000'
              : p === 'Urgent'
              ? '#ffa500'
              : 'var(--color-brand-primary)';

          return (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-circular)',
                fontSize: '0.72rem',
                fontWeight: 700,
                backgroundColor: bg,
                color,
              }}
            >
              {p}
            </span>
          );
        },
      },
      {
        key: 'status',
        label: 'Workflow Status',
        sortable: true,
        render: (row) => {
          const isActive = ['Submitted', 'Accepted', 'Specimen Received', 'In Progress'].includes(row.status);
          const isCompleted = row.status === 'Completed';
          const bg = isCompleted
            ? 'var(--color-status-success-bg)'
            : isActive
            ? 'var(--color-brand-secondary-bg)'
            : 'var(--color-status-danger-bg)';
          const color = isCompleted
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
        key: 'createdAt',
        label: 'Order Date',
        sortable: true,
        render: (row) => new Date(row.createdAt).toLocaleDateString(),
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (row) => {
          const items = [
            {
              label: 'View Requisition',
              onClick: () => onViewDetails(row.orderId),
              permission: Permission.ORDER_VIEW,
            },
            {
              label: 'Edit Requisition',
              onClick: () => onEditOrder(row.orderId),
              permission: Permission.ORDER_EDIT,
            },
            {
              label: 'Cancel Order',
              onClick: () => handleCancel(row.orderId, row.accessionNumber),
              permission: Permission.ORDER_CANCEL,
              danger: true,
            },
          ];
          return <ActionMenu items={items} align="right" />;
        },
      },
    ];
  }, [handleCancel, onViewDetails, onEditOrder]);

  // Seeding dynamic count variables for KPI summary bar
  const kpiItems = useMemo(() => {
    const totalCount = total;
    const statCount = orders.filter((o) => o.priority === 'STAT' || o.priority === 'Emergency').length;
    const collectedCount = orders.filter((o) => o.collectionStatus === 'Collected').length;
    const pendingCollection = orders.filter((o) => o.status === 'Specimen Awaiting').length;

    return [
      { id: 'total', title: 'Total Orders', value: totalCount, indicatorColor: 'var(--color-brand-primary)' },
      { id: 'pending', title: 'Pending Specimen', value: pendingCollection, indicatorColor: '#ffa500' },
      { id: 'stat', title: 'STAT / Emergency', value: statCount, indicatorColor: 'var(--color-status-danger)', trend: { direction: 'up' as const, value: 'High priority' } },
      { id: 'collected', title: 'Specimens Collected', value: collectedCount, indicatorColor: 'var(--color-status-success)' },
    ];
  }, [orders, total]);

  const activeChips = useMemo(() => {
    const list = [];
    if (statusFilter !== 'All') {
      list.push({ key: 'status', label: 'Status', valueLabel: statusFilter });
    }
    if (priorityFilter !== 'All') {
      list.push({ key: 'priority', label: 'Priority', valueLabel: priorityFilter });
    }
    if (advOpen) {
      if (advPhysician) list.push({ key: 'physician', label: 'Physician', valueLabel: advPhysician });
      if (advInvestigation) list.push({ key: 'investigation', label: 'Test', valueLabel: advInvestigation });
    }
    return list;
  }, [statusFilter, priorityFilter, advOpen, advPhysician, advInvestigation]);

  const handleRemoveChip = (key: string) => {
    if (key === 'status') setStatusFilter('All');
    else if (key === 'priority') setPriorityFilter('All');
    else {
      if (key === 'physician') setAdvPhysician('');
      if (key === 'investigation') setAdvInvestigation('');
    }
  };

  const handleClearAllChips = () => {
    setStatusFilter('All');
    setPriorityFilter('All');
    setAdvPhysician('');
    setAdvInvestigation('');
  };

  const densityClass = useMemo(() => {
    if (density === 'high-density') return 'density-high';
    if (density === 'compact') return 'density-compact';
    return 'density-comfortable';
  }, [density]);

  const totalPages = Math.ceil(total / pageSize);

  const extraActions = (
    <div style={{ display: 'flex', gap: 'var(--spacing-xs)', alignItems: 'center' }}>
      {canPrint && (
        <Button variant="outline" onClick={handlePrintLabels}>
          Print Labels
        </Button>
      )}
    </div>
  );

  const extraFiltersBlock = (
    <div style={styles.filtersWrapper}>
      <div style={styles.statusFilters}>
        {['All', 'Pending', 'Submitted', 'In Progress', 'Completed'].map((s) => (
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

      <select
        value={priorityFilter}
        onChange={(e) => {
          setPriorityFilter(e.target.value);
          setCurrentPage(1);
        }}
        className="lims-input"
        style={{ width: '130px', height: '36px' }}
      >
        <option value="All">All Priorities</option>
        <option value="Routine">Routine</option>
        <option value="Urgent">Urgent</option>
        <option value="STAT">STAT</option>
        <option value="Emergency">Emergency</option>
      </select>

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
            trend={item.trend}
          />
        ))}
      </div>

      {/* 2. Controls Toolbar */}
      <ModuleToolbar
        title="Orders"
        subtitle="Specimens Requisitions Registry"
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search order no, MRN, patient name, doctor..."
        filterItems={activeChips}
        onRemoveFilter={handleRemoveChip}
        onClearAllFilters={handleClearAllChips}
        onRefresh={fetchOrders}
        onExport={canExport ? handleExport : undefined}
        onCreate={canCreate ? onCreateOrder : undefined}
        createLabel="Create Requisition"
        extraActions={extraActions}
        extraFilters={extraFiltersBlock}
      />

      {/* Recent searches */}
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

      {/* 3. Advanced drawer */}
      {advOpen && (
        <div style={styles.advSearchPanel}>
          <h4 style={{ margin: '0 0 var(--spacing-sm) 0', font: 'var(--type-heading-item)' }}>Advanced Selection Drawer</h4>
          <div style={styles.advGrid}>
            <TextInput
              label="Ordering Physician"
              value={advPhysician}
              onChange={(e) => setAdvPhysician(e.target.value)}
              placeholder="e.g. Dr. House"
            />
            <select
              value={advInvestigation}
              onChange={(e) => setAdvInvestigation(e.target.value)}
              className="lims-input"
              style={{ height: '38px', marginTop: '22px' }}
            >
              <option value="">Filter by Investigation Test</option>
              {TEST_CATALOG.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-sm)' }}>
            <Button
              variant="outline"
              onClick={() => {
                setAdvPhysician('');
                setAdvInvestigation('');
                fetchOrders();
              }}
            >
              Clear Filters
            </Button>
            <Button variant="solid" onClick={fetchOrders}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {/* Bulk actions */}
      {selectedKeys.length > 0 && (
        <div style={styles.bulkActionBar}>
          <span>Selected: <strong>{selectedKeys.length}</strong> requisitions</span>
          <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
            {canPrint && (
              <Button variant="outline" onClick={handlePrintLabels}>
                Print Barcode Labels
              </Button>
            )}
            {canEdit && (
              <select
                onChange={(e) => handleBulkPriority(e.target.value as OrderPriority)}
                className="lims-input"
                style={{ width: '130px', height: '32px', padding: '2px 8px', fontSize: '0.8rem' }}
                defaultValue=""
              >
                <option value="" disabled>Change Priority</option>
                <option value="Routine">Routine</option>
                <option value="Urgent">Urgent</option>
                <option value="STAT">STAT</option>
                <option value="Emergency">Emergency</option>
              </select>
            )}
            {canCancel && (
              <Button variant="outline" onClick={handleBulkCancel} style={{ color: 'var(--color-status-danger)' }}>
                Cancel Selected
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 4. Table */}
      <ContentCard
        loading={loading}
        error={error}
        empty={!loading && orders.length === 0}
        emptyTitle="No Requisitions Found"
        emptyDescription="There are no diagnostic orders matches corresponding filters."
        onRetry={fetchOrders}
      >
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <DataTable
            columns={columns}
            data={orders}
            rowKey="orderId"
            selectable
            selectedKeys={selectedKeys}
            onSelectKeys={setSelectedKeys}
            className={densityClass}
          />
        </div>
      </ContentCard>

      {/* 5. Pagination */}
      {!loading && !error && orders.length > 0 && (
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

const styles: Record<string, React.CSSProperties> = {
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
export default OrderList;
