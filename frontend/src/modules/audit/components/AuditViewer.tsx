import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { AuditRecord } from '../models/types';
import { AuditService } from '../services/auditService';
import { useGlobalState } from '../../../providers/GlobalStateProvider';
import { DataTable, type ColumnDef, Pagination } from '../../../components/Data';
import { Button } from '../../../components/Foundation/Button';
import { Card } from '../../../components/Layout/Card';
import { useNotification } from '../../../infrastructure/notifications/useNotification';

export const AuditViewer: React.FC = () => {
  const { density } = useGlobalState();
  const { addToast } = useNotification();

  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AuditService.getLogs({
        page: currentPage,
        limit: pageSize,
        search,
        module: moduleFilter === 'All' ? undefined : moduleFilter,
        severity: severityFilter === 'All' ? undefined : severityFilter,
      });
      setLogs(res.records);
      setTotal(res.total);
    } catch { /* silently ignore */ }
    finally {
      setLoading(false);
    }
  }, [currentPage, search, moduleFilter, severityFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExport = async () => {
    try {
      const res = await AuditService.exportLogs();
      addToast('success', `Audit log CSV generated. Download link: ${res.downloadUrl}`);
    } catch {
      addToast('error', 'Audit export failed.');
    }
  };

  const columns = useMemo<ColumnDef<AuditRecord>[]>(() => [
    {
      key: 'eventId', label: 'Event ID',
      render: (a) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{a.eventId}</span>,
    },
    {
      key: 'timestamp', label: 'Timestamp', sortable: true,
      render: (a) => <span style={{ fontSize: '0.78rem' }}>{new Date(a.timestamp).toLocaleString()}</span>,
    },
    {
      key: 'module', label: 'Module', sortable: true,
      render: (a) => <span style={{ fontWeight: 600 }}>{a.module}</span>,
    },
    {
      key: 'user', label: 'User',
      render: (a) => <code style={{ fontSize: '0.78rem' }}>{a.user}</code>,
    },
    {
      key: 'action', label: 'Action',
      render: (a) => <strong>{a.action}</strong>,
    },
    {
      key: 'severity', label: 'Severity',
      render: (a) => {
        const color = a.severity === 'Critical' ? 'var(--color-status-danger)' : a.severity === 'High' ? 'orange' : 'var(--color-text-secondary)';
        return <span style={{ color, fontWeight: 700 }}>{a.severity}</span>;
      },
    },
    {
      key: 'outcome', label: 'Outcome',
      render: (a) => (
        <span style={{
          padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600,
          backgroundColor: a.outcome === 'Success' ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
          color: a.outcome === 'Success' ? 'var(--color-status-success)' : 'var(--color-status-danger)',
        }}>
          {a.outcome}
        </span>
      ),
    },
    {
      key: 'details', label: 'Details',
      render: (a) => <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>{a.details}</span>,
    },
  ], []);

  const densityClass = density === 'high-density' ? 'density-high' : density === 'compact' ? 'density-compact' : 'density-comfortable';

  return (
    <Card style={{ padding: 'var(--spacing-md)' }}>
      {/* Filtering console */}
      <div style={styles.filterRow}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
          <input
            type="text"
            placeholder="Search audit trail..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="lims-input"
            style={{ width: '220px', height: '34px', fontSize: '0.82rem' }}
          />
          <select
            value={moduleFilter}
            onChange={(e) => { setModuleFilter(e.target.value); setCurrentPage(1); }}
            className="lims-input"
            style={{ height: '34px', padding: '0 6px', fontSize: '0.8rem' }}
          >
            <option value="All">All Modules</option>
            <option value="Patients">Patients</option>
            <option value="Orders">Orders</option>
            <option value="Specimens">Specimens</option>
            <option value="Culture">Cultures</option>
            <option value="Identification">Identification</option>
            <option value="AST">AST</option>
            <option value="Validation">Validation</option>
            <option value="Reporting">Reporting</option>
            <option value="Admin">Admin</option>
          </select>
          <select
            value={severityFilter}
            onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(1); }}
            className="lims-input"
            style={{ height: '34px', padding: '0 6px', fontSize: '0.8rem' }}
          >
            <option value="All">All Severities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <Button variant="outline" onClick={handleExport} style={{ height: '34px' }}>
          📤 Export CSV Trail
        </Button>
      </div>

      {/* Grid */}
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <DataTable columns={columns} data={logs} rowKey="eventId" className={densityClass} />
      </div>

      {!loading && logs.length > 0 && (
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
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  filterRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border-default)', paddingTop: 'var(--spacing-sm)', marginTop: '8px', flexWrap: 'wrap', gap: '8px' },
};

export default AuditViewer;
