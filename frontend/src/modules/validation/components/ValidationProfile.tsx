import React, { useState, useEffect, useCallback } from 'react';
import type { ValidationRecord } from '../models/types';
import { ValidationService } from '../services/validationService';
import { ValidationWorkspace } from './ValidationWorkspace';
import { useNotification } from '../../../infrastructure/notifications/useNotification';

import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { Tabs } from '../../../components/Layout/Tabs';
import {
  AttachmentPanel,
  TimelineViewer,
  AuditViewer,
  NotesPanel,
  TaskAssignmentPanel,
} from '../../../components/Laboratory';

interface ValidationProfileProps {
  validationId: string;
  onBack: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  'Approved':                  'var(--color-status-success)',
  'Rejected':                  'var(--color-status-danger)',
  'Released For Reporting':    '#0891b2',
  'Returned For Correction':   'crimson',
  'Pending Technical Validation': 'var(--color-status-warning)',
  'Technical Validation In Progress': '#6366f1',
  'Pending Clinical Validation': 'orange',
  'Clinical Validation In Progress': '#7c3aed',
};

export const ValidationProfile: React.FC<ValidationProfileProps> = ({ validationId, onBack }) => {
  const { addToast } = useNotification();

  const [record, setRecord] = useState<ValidationRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const [notesList, setNotesList] = useState<any[]>([
    {
      id: 'N-VAL-01',
      author: 'supervisor_user',
      role: 'Supervisor',
      timestamp: new Date().toISOString(),
      category: 'Laboratory',
      content: 'Validation initiated per standard laboratory authorization procedure.',
    },
  ]);

  const fetchRecord = useCallback(async () => {
    setLoading(true);
    try {
      const r = await ValidationService.getById(validationId);
      setRecord(r);
    } catch {
      addToast('error', 'Failed to load validation record.');
    } finally {
      setLoading(false);
    }
  }, [validationId, addToast]);

  useEffect(() => { fetchRecord(); }, [fetchRecord]);

  if (loading) {
    return <p style={{ padding: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>Loading validation record...</p>;
  }

  if (!record) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-status-danger)' }}>Validation record not found.</p>
        <Button onClick={onBack} variant="outline" style={{ marginTop: '12px' }}>Back to Worklist</Button>
      </div>
    );
  }

  const statusColor = STATUS_COLOR[record.status] ?? 'var(--color-text-secondary)';

  // Build timeline from history
  const timelineEvents = record.history.map((h) => ({
    id: h.historyId,
    title: h.action,
    time: h.timestamp,
    severity: h.toStatus === 'Approved' || h.toStatus === 'Released For Reporting' ? 'Success' as const
      : h.toStatus === 'Rejected' ? 'Critical' as const
      : 'Info' as const,
    performedBy: h.performedBy,
    role: h.stage,
    comments: h.reason,
  }));

  // Build audit from history + stage decisions
  const auditRecords = [
    {
      id: 'AUD-VAL-0',
      timestamp: record.createdAt,
      performedBy: 'system',
      module: 'Validation',
      action: 'Validation Record Created',
      field: 'Status',
      oldValue: '—',
      newValue: 'Created',
    },
    ...record.history.map((h) => ({
      id: h.historyId,
      timestamp: h.timestamp,
      performedBy: h.performedBy,
      module: 'Validation',
      action: h.action,
      field: 'Status',
      oldValue: h.fromStatus,
      newValue: h.toStatus,
    })),
  ];

  const tabItems = [
    {
      id: 'workspace',
      label: 'Validation Workspace',
      content: (
        <ValidationWorkspace
          record={record}
          onRecordUpdate={(updated) => setRecord(updated)}
        />
      ),
    },
    {
      id: 'timeline',
      label: 'Timeline',
      content: <TimelineViewer events={timelineEvents} />,
    },
    {
      id: 'notes',
      label: 'Notes',
      content: (
        <NotesPanel
          notes={notesList}
          onAddNote={(note) =>
            setNotesList([...notesList, {
              id: `N-VAL-${notesList.length + 1}`,
              author: 'supervisor_user',
              role: 'Supervisor',
              timestamp: new Date().toISOString(),
              category: note.category,
              content: note.content,
            }])
          }
        />
      ),
    },
    {
      id: 'attachments',
      label: 'Attachments',
      content: <AttachmentPanel entityId={record.validationId} />,
    },
    {
      id: 'audit',
      label: 'Audit Log',
      content: <AuditViewer audits={auditRecords} />,
    },
    {
      id: 'tasks',
      label: 'Task Assignment',
      content: (
        <TaskAssignmentPanel
          task={{
            taskId: record.validationId,
            assignedTo: record.stages[0]?.assignment?.assignedTo ?? 'Unassigned',
            queue: 'Validation',
            priority: record.priority === 'Stat' ? 'STAT' : record.priority,
            dueDate: new Date().toISOString(),
          }}
          onUpdateAssignment={(upd) => addToast('success', `Reassigned to ${upd.assignedTo || 'Unassigned'}.`)}
        />
      ),
    },
    {
      id: 'history',
      label: 'Validation History',
      content: (
        <div style={{ padding: 'var(--spacing-md)' }}>
          {record.history.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)' }}>No history entries yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  {['Stage', 'Action', 'From', 'To', 'By', 'Date'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 10px', borderBottom: '1px solid var(--color-border-default)', color: 'var(--color-text-secondary)', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {record.history.map((h) => (
                  <tr key={h.historyId}>
                    <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--color-border-default)' }}>{h.stage}</td>
                    <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--color-border-default)', fontWeight: 600 }}>{h.action}</td>
                    <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--color-border-default)', color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>{h.fromStatus}</td>
                    <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--color-border-default)', fontWeight: 600 }}>{h.toStatus}</td>
                    <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--color-border-default)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{h.performedBy}</td>
                    <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--color-border-default)', color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>{new Date(h.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={{ font: 'var(--type-heading-page)', margin: 0 }}>
            Validation Record: {record.validationId}
          </h2>
          <p style={{ margin: '4px 0 0', font: 'var(--type-body-small)', color: 'var(--color-text-secondary)' }}>
            AST: <strong>{record.astId}</strong> &nbsp;|&nbsp;
            Organism: <strong>{record.organismName}</strong> &nbsp;|&nbsp;
            Patient: <strong>{record.patientName ?? '—'}</strong> &nbsp;|&nbsp;
            Status: <strong style={{ color: statusColor }}>{record.status}</strong> &nbsp;|&nbsp;
            Priority: <strong style={{ color: record.priority === 'Stat' ? '#dc2626' : record.priority === 'Urgent' ? 'orange' : 'inherit' }}>
              {record.priority}
            </strong>
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>Back to Worklist</Button>
      </div>

      {/* Stage progress summary */}
      <div style={styles.progressBar}>
        <div style={{
          width: `${record.summary.overallProgress}%`, height: '100%',
          backgroundColor: record.summary.overallProgress === 100 ? 'var(--color-status-success)' : 'var(--color-brand-primary)',
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Tabs */}
      <Card style={{ marginTop: '4px' }}>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: 'var(--spacing-sm)', flexWrap: 'wrap', gap: '10px',
  },
  progressBar: {
    height: '5px', borderRadius: '3px',
    backgroundColor: 'var(--color-border-default)', overflow: 'hidden',
  },
};

export default ValidationProfile;
