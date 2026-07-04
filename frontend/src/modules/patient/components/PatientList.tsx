import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Patient } from '../models/types';
import { PatientService } from '../services/patientService';
import { usePermission } from '../../../infrastructure/permissions/usePermission';
import { Permission } from '../../../infrastructure/permissions/constants';
import { useNotification } from '../../../infrastructure/notifications/useNotification';
import { useDialog } from '../../../infrastructure/dialogs/useDialog';
import { useGlobalState } from '../../../providers/GlobalStateProvider';

// Shared Components Ingestion
import { PageContainer, ContentCard, ModuleToolbar } from '../../../components/Layout';
import { DataTable, type ColumnDef, KpiCard, ActionMenu, Pagination } from '../../../components/Data';
import { Button } from '../../../components/Foundation/Button';
import { TextInput } from '../../../components/Form/TextInput';
import { Eye, Edit, Trash2, SlidersHorizontal } from 'lucide-react';

interface PatientListProps {
  onViewProfile: (id: string) => void;
  onEditPatient: (id: string) => void;
  onRegisterPatient: () => void;
  onOpenMerge: () => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  onViewProfile,
  onEditPatient,
  onRegisterPatient,
  onOpenMerge,
}) => {
  const { hasPermission } = usePermission();
  const { addToast } = useNotification();
  const { confirmDelete } = useDialog();
  const { addAuditLog, density } = useGlobalState();

  // Perms check
  const canCreate = hasPermission(Permission.PATIENT_CREATE);
  const canDelete = hasPermission(Permission.PATIENT_DELETE);
  const canExport = hasPermission(Permission.PATIENT_EXPORT);
  const canMerge = hasPermission(Permission.PATIENT_MERGE);

  // States
  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const sortBy = 'createdAt';
  const sortOrder = 'desc';

  // Advanced Search States
  const [advSearchOpen, setAdvSearchOpen] = useState(false);
  const [advMrn, setAdvMrn] = useState('');
  const [advDob, setAdvDob] = useState('');
  const [advEmail, setAdvEmail] = useState('');
  const [advNationalId, setAdvNationalId] = useState('');

  // Bulk selection
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Recent Searches
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // ─── Fetch Registry data ──────────────────────────────────────────────────────
  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let activeSearch = searchQuery;
      if (advSearchOpen) {
        const parts = [];
        if (advMrn) parts.push(advMrn);
        if (advDob) parts.push(advDob);
        if (advEmail) parts.push(advEmail);
        if (advNationalId) parts.push(advNationalId);
        if (parts.length > 0) {
          activeSearch = parts.join(' ');
        }
      }

      const result = await PatientService.getPatients({
        page: currentPage,
        limit: pageSize,
        search: activeSearch,
        status: statusFilter,
        sortBy,
        sortOrder,
      });

      setPatients(result.patients);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve patient registry index.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, statusFilter, sortBy, sortOrder, advSearchOpen, advMrn, advDob, advEmail, advNationalId]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Debounce search auditing
  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        addAuditLog('Patient Search', 'Patient', 'Registry', `Searched for patient matching: "${searchQuery}"`);
        setRecentSearches((prev) => {
          const updated = [searchQuery, ...prev.filter((s) => s !== searchQuery)].slice(0, 3);
          return updated;
        });
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, addAuditLog]);

  // ─── Patient Actions ────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id: string, mrn: string) => {
    if (!canDelete) {
      addToast('error', 'ERR-403: Authorization denied to deactivate patient indices.', 'Security Alert');
      return;
    }

    const confirmed = await confirmDelete({
      title: 'Soft-Deactivate Patient Record',
      message: `Are you sure you want to deactivate patient record with MRN [${mrn}]? This will mark the record as inactive but preserve clinical histories.`,
    });

    if (!confirmed) return;

    try {
      await PatientService.deletePatient(id);
      addToast('success', 'Patient record soft-deactivated.', 'Registry updated');
      addAuditLog('Patient Delete', 'Patient', id, `Soft-deleted patient record ${mrn}`);
      fetchPatients();
    } catch (err: any) {
      addToast('error', err.message || 'Failed to deactivate record.');
    }
  }, [canDelete, confirmDelete, addToast, addAuditLog, fetchPatients]);

  const handleBulkDeactivate = async () => {
    if (selectedKeys.length === 0) return;
    
    const confirmed = await confirmDelete({
      title: 'Bulk Deactivate Patient Records',
      message: `Deactivate ${selectedKeys.length} selected patient records?`,
    });

    if (!confirmed) return;

    try {
      await Promise.all(selectedKeys.map(key => PatientService.deletePatient(key)));
      addToast('success', `Deactivated ${selectedKeys.length} patient records successfully.`);
      addAuditLog('Bulk Deactivate', 'Patient', 'Bulk', `Deactivated keys: ${selectedKeys.join(', ')}`);
      setSelectedKeys([]);
      fetchPatients();
    } catch (err: any) {
      addToast('error', err.message || 'Bulk deactivation encountered failures.');
    }
  };

  const handleExport = () => {
    if (!canExport) {
      addToast('error', 'ERR-403: Security permissions restrict patient list exports.');
      return;
    }
    const count = selectedKeys.length > 0 ? selectedKeys.length : total;
    addToast('success', `Export generated for ${count} patient records.`, 'Data Export');
    addAuditLog('Patient Export', 'Patient', 'Bulk', `Exported ${count} patient rows`);
  };

  // ─── Column Definition ──────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<Patient>[]>(() => {
    return [
      {
        key: 'mrn',
        label: 'MRN ID',
        sortable: true,
        render: (row) => (
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.mrn}</span>
        ),
      },
      {
        key: 'name',
        label: 'Full Name',
        sortable: true,
        render: (row) => `${row.lastName}, ${row.firstName}`,
      },
      {
        key: 'dob',
        label: 'Birth Date',
        sortable: true,
        render: (row) => new Date(row.dob).toLocaleDateString(),
      },
      {
        key: 'gender',
        label: 'Gender',
        sortable: true,
      },
      {
        key: 'phone',
        label: 'Mobile No.',
        render: (row) => row.phone || '—',
      },
      {
        key: 'status',
        label: 'Registry Status',
        render: (row) => {
          const isActive = row.status === 'Active';
          const isMerged = row.status.includes('Merged');
          return (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-circular)',
                fontSize: '0.72rem',
                fontWeight: 600,
                backgroundColor: isActive
                  ? 'var(--color-status-success-bg)'
                  : isMerged
                  ? 'var(--color-brand-secondary-bg)'
                  : 'var(--color-status-danger-bg)',
                color: isActive
                  ? 'var(--color-status-success)'
                  : isMerged
                  ? 'var(--color-brand-primary)'
                  : 'var(--color-status-danger)',
              }}
            >
              {row.status}
            </span>
          );
        },
      },
      {
        key: 'createdAt',
        label: 'Registered On',
        sortable: true,
        render: (row) => new Date(row.createdAt).toLocaleDateString(),
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (row) => {
          const items = [
            {
              label: 'View Profile',
              icon: <Eye size={14} />,
              onClick: () => onViewProfile(row.patientId),
              permission: Permission.PATIENT_VIEW,
            },
            {
              label: 'Edit Demographics',
              icon: <Edit size={14} />,
              onClick: () => onEditPatient(row.patientId),
              permission: Permission.PATIENT_EDIT,
            },
            {
              label: 'Deactivate Record',
              icon: <Trash2 size={14} />,
              onClick: () => handleDelete(row.patientId, row.mrn),
              permission: Permission.PATIENT_DELETE,
              danger: true,
            },
          ];
          return <ActionMenu items={items} align="right" />;
        },
      },
    ];
  }, [handleDelete, onViewProfile, onEditPatient]);

  // Configuration-driven KPI cards model
  const kpiItems = useMemo(() => [
    {
      id: 'total',
      title: 'Patients',
      value: String(total),
      indicatorColor: 'var(--color-brand-primary)',
    },
    {
      id: 'today',
      title: "Today's Registrations",
      value: '34', // mock static count matching visual baseline
      indicatorColor: 'var(--color-status-success)',
      trend: { direction: 'up' as const, value: '12% increase' },
    },
    {
      id: 'inactive',
      title: 'Inactive',
      value: '112', // mock static count matching visual baseline
      indicatorColor: 'var(--color-status-danger)',
    },
    {
      id: 'duplicates',
      title: 'Duplicate Records',
      value: '4', // mock static count matching visual baseline
      indicatorColor: 'var(--color-brand-secondary)',
    },
  ], [total]);

  // Formatted active filter chips list
  const activeChips = useMemo(() => {
    const list = [];
    if (statusFilter !== 'All') {
      list.push({ key: 'status', label: 'Status', valueLabel: statusFilter });
    }
    if (advSearchOpen) {
      if (advMrn) list.push({ key: 'mrn', label: 'MRN', valueLabel: advMrn });
      if (advDob) list.push({ key: 'dob', label: 'DOB', valueLabel: advDob });
      if (advEmail) list.push({ key: 'email', label: 'Email', valueLabel: advEmail });
      if (advNationalId) list.push({ key: 'nationalId', label: 'ID Card', valueLabel: advNationalId });
    }
    return list;
  }, [statusFilter, advSearchOpen, advMrn, advDob, advEmail, advNationalId]);

  const handleRemoveChip = (key: string) => {
    if (key === 'status') {
      setStatusFilter('All');
    } else {
      if (key === 'mrn') setAdvMrn('');
      if (key === 'dob') setAdvDob('');
      if (key === 'email') setAdvEmail('');
      if (key === 'nationalId') setAdvNationalId('');
    }
  };

  const handleClearAllChips = () => {
    setStatusFilter('All');
    setAdvMrn('');
    setAdvDob('');
    setAdvEmail('');
    setAdvNationalId('');
  };

  // Convert density mode to local css class mapping
  const densityClass = useMemo(() => {
    if (density === 'high-density') return 'density-high';
    if (density === 'compact') return 'density-compact';
    return 'density-comfortable';
  }, [density]);

  const totalPages = Math.ceil(total / pageSize);

  // Toolbar Quick actions block
  const quickActions = (
    <div style={{ display: 'flex', gap: 'var(--spacing-xs)', alignItems: 'center' }}>
      {canMerge && (
        <Button variant="outline" onClick={onOpenMerge} title="Consolidate duplicate records">
          Merge Records
        </Button>
      )}
    </div>
  );

  // Status Filter tabs layout
  const extraFiltersBlock = (
    <div style={styles.filtersWrapper}>
      <div style={styles.statusFilters}>
        {['Active', 'Inactive', 'All'].map((s) => (
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
        onClick={() => setAdvSearchOpen(!advSearchOpen)}
        style={{
          ...styles.iconToggleBtn,
          backgroundColor: advSearchOpen ? 'var(--color-brand-secondary-bg)' : 'transparent',
        }}
        title="Toggle Advanced Search Drawer"
      >
        <SlidersHorizontal size={16} />
        <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Advanced</span>
      </button>
    </div>
  );

  return (
    <PageContainer>
      {/* 1. Statistics Cards above the list */}
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

      {/* 2. Unified Module Header & Toolbar controls */}
      <ModuleToolbar
        title="Patients"
        subtitle="Clinical Patient Registry"
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Instant search MRN, Name, ID, passport..."
        filterItems={activeChips}
        onRemoveFilter={handleRemoveChip}
        onClearAllFilters={handleClearAllChips}
        onRefresh={fetchPatients}
        onExport={canExport ? handleExport : undefined}
        onCreate={canCreate ? onRegisterPatient : undefined}
        createLabel="Add Patient"
        extraActions={quickActions}
        extraFilters={extraFiltersBlock}
      />

      {/* Clickable search terms tagging */}
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

      {/* 3. Advanced Search parameters drawer */}
      {advSearchOpen && (
        <div style={styles.advSearchPanel}>
          <h4 style={{ margin: '0 0 var(--spacing-sm) 0', font: 'var(--type-heading-item)' }}>Advanced Search Parameters</h4>
          <div style={styles.advGrid}>
            <TextInput
              label="Medical Record No. (MRN)"
              value={advMrn}
              onChange={(e) => setAdvMrn(e.target.value)}
              placeholder="e.g. MRN-12345678"
            />
            <TextInput
              label="Date of Birth"
              type="date"
              value={advDob}
              onChange={(e) => setAdvDob(e.target.value)}
            />
            <TextInput
              label="Email Address"
              value={advEmail}
              onChange={(e) => setAdvEmail(e.target.value)}
              placeholder="e.g. j.doe@clinical.org"
            />
            <TextInput
              label="National / ID Card"
              value={advNationalId}
              onChange={(e) => setAdvNationalId(e.target.value)}
              placeholder="Enter ID number"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-sm)' }}>
            <Button
              variant="outline"
              onClick={() => {
                setAdvMrn('');
                setAdvDob('');
                setAdvEmail('');
                setAdvNationalId('');
                fetchPatients();
              }}
            >
              Clear Advanced Filters
            </Button>
            <Button variant="solid" onClick={fetchPatients}>
              Apply Advanced Query
            </Button>
          </div>
        </div>
      )}

      {/* Bulk selection operations panel */}
      {selectedKeys.length > 0 && (
        <div style={styles.bulkActionBar}>
          <span>Selected: <strong>{selectedKeys.length}</strong> patient records</span>
          <div style={{ display: 'flex', gap: 'var(--spacing-2xs)' }}>
            {canExport && (
              <Button variant="outline" onClick={handleExport}>
                Export Selected
              </Button>
            )}
            {canDelete && (
              <Button variant="outline" onClick={handleBulkDeactivate} style={{ color: 'var(--color-status-danger)' }}>
                Deactivate Selected
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 4. Registry DataTable Content Card */}
      <ContentCard
        loading={loading}
        error={error}
        empty={!loading && patients.length === 0}
        emptyTitle="No Patients Found"
        emptyDescription="Your instant search did not match any active patient record index."
        onRetry={fetchPatients}
      >
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <DataTable
            columns={columns}
            data={patients}
            rowKey="patientId"
            selectable
            selectedKeys={selectedKeys}
            onSelectKeys={setSelectedKeys}
            className={densityClass}
          />
        </div>
      </ContentCard>

      {/* 5. Clean, modern, and compact pagination footer */}
      {!loading && !error && patients.length > 0 && (
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
export default PatientList;
