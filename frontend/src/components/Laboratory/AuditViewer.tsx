import React, { useState } from 'react';
import { Card } from '../Layout/Card';
import { Button } from '../Foundation/Button';
import { TextInput } from '../Form/TextInput';

export interface AuditRecord {
  id: string;
  timestamp: string;
  performedBy: string;
  module: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
}

interface AuditViewerProps {
  audits: AuditRecord[];
}

export const AuditViewer: React.FC<AuditViewerProps> = ({ audits }) => {
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [selectedAudit, setSelectedAudit] = useState<AuditRecord | null>(null);

  // Filters logic
  const filtered = audits.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(search.toLowerCase()) ||
      (log.field && log.field.toLowerCase().includes(search.toLowerCase())) ||
      (log.reason && log.reason.toLowerCase().includes(search.toLowerCase()));

    const matchesModule = moduleFilter === 'All' || log.module === moduleFilter;

    return matchesSearch && matchesModule;
  });

  const uniqueModules = Array.from(new Set(audits.map((a) => a.module)));

  return (
    <Card style={styles.container}>
      <h4 style={styles.title}>Universal System Audit Trail Logs</h4>

      {/* Filters Toolbar */}
      <div style={styles.toolbar}>
        <TextInput
          label="Search Audits"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search actions, users, fields, reasons..."
          style={{ flex: 1 }}
        />
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="lims-input"
          style={styles.select}
        >
          <option value="All">All Modules</option>
          {uniqueModules.map((mod) => (
            <option key={mod} value={mod}>{mod}</option>
          ))}
        </select>
      </div>

      {/* Audits table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date & Time</th>
              <th style={styles.th}>Source</th>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Action Event</th>
              <th style={styles.th}>Target Element</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '12px', color: 'gray' }}>
                  No system audits match the criteria.
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id} style={styles.tr}>
                  <td style={styles.td}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td style={styles.td}>
                    <span style={styles.moduleBadge}>{log.module}</span>
                  </td>
                  <td style={styles.td}><strong>{log.performedBy}</strong></td>
                  <td style={styles.td}>{log.action}</td>
                  <td style={styles.td}>{log.field || '—'}</td>
                  <td style={styles.td}>
                    <Button variant="outline" onClick={() => setSelectedAudit(log)}>
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* State Inspect Side Drawer */}
      {selectedAudit && (
        <div style={styles.drawerOverlay} onClick={() => setSelectedAudit(null)}>
          <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <h4 style={{ margin: 0 }}>Inspect Audit Details</h4>
              <Button variant="outline" onClick={() => setSelectedAudit(null)}>Close</Button>
            </div>

            <div style={styles.drawerBody}>
              <p>Audit ID: <strong>{selectedAudit.id}</strong></p>
              <p>Timestamp: <strong>{new Date(selectedAudit.timestamp).toLocaleString()}</strong></p>
              <p>Action trigger: <strong>{selectedAudit.action}</strong></p>
              <p>Performed by: <strong>{selectedAudit.performedBy}</strong></p>
              {selectedAudit.reason && <p>Amendment Reason: <em style={{ color: 'var(--color-status-danger)' }}>{selectedAudit.reason}</em></p>}

              {/* State diff visualization */}
              {selectedAudit.field && (
                <div style={{ marginTop: '12px' }}>
                  <strong>State Alteration Diff Details ({selectedAudit.field}):</strong>
                  <div style={styles.diffPanel}>
                    <div style={styles.diffRemoved}>
                      <strong>- Removed State:</strong>
                      <pre style={styles.pre}>{selectedAudit.oldValue || 'None'}</pre>
                    </div>
                    <div style={styles.diffAdded}>
                      <strong>+ Added State:</strong>
                      <pre style={styles.pre}>{selectedAudit.newValue || 'None'}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 'var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  },
  title: {
    font: 'var(--type-heading-item)',
    margin: 0,
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: '4px',
  },
  toolbar: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  select: {
    height: '38px',
    padding: '0 8px',
  },
  tableWrapper: {
    overflowX: 'auto',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-xs)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.82rem',
  },
  th: {
    backgroundColor: 'var(--color-surface-base)',
    borderBottom: '1px solid var(--color-border-default)',
    padding: '8px 10px',
    textAlign: 'left',
    color: 'var(--color-text-secondary)',
    fontWeight: 'bold',
  },
  td: {
    padding: '8px 10px',
    borderBottom: '1px solid var(--color-border-default)',
  },
  tr: {
    transition: 'background-color 0.2s',
  },
  moduleBadge: {
    padding: '2px 6px',
    fontSize: '0.68rem',
    fontWeight: 'bold',
    borderRadius: '4px',
    backgroundColor: 'var(--color-brand-secondary-bg)',
    color: 'var(--color-brand-primary)',
  },
  drawerOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: 1300,
  },
  drawer: {
    width: '420px',
    height: '100%',
    backgroundColor: 'var(--color-surface-raised)',
    boxShadow: 'var(--elevation-3)',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  drawerHeader: {
    padding: 'var(--spacing-md)',
    borderBottom: '1px solid var(--color-border-default)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drawerBody: {
    padding: 'var(--spacing-md)',
    overflowY: 'auto',
    flexGrow: 1,
    fontSize: '0.85rem',
  },
  diffPanel: {
    marginTop: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontFamily: 'monospace',
    fontSize: '0.8rem',
  },
  diffRemoved: {
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
    border: '1px solid rgba(255, 0, 0, 0.2)',
    borderRadius: '4px',
    padding: '6px',
    color: '#8b0000',
  },
  diffAdded: {
    backgroundColor: 'rgba(0, 128, 0, 0.05)',
    border: '1px solid rgba(0, 128, 0, 0.2)',
    borderRadius: '4px',
    padding: '6px',
    color: 'green',
  },
  pre: {
    margin: '4px 0 0 0',
    whiteSpace: 'pre-wrap',
  },
};
export default AuditViewer;
