import React, { useState, useEffect, useCallback } from 'react';
import type { LaboratoryReport, DistributionRecord, ReportSignature } from '../models/types';
import { ReportService } from '../services/reportService';
import { ReportPreview } from './ReportPreview';
import { ReportDesigner } from './ReportDesigner';
import { DistributionPanel } from './DistributionPanel';
import { ReportSignatureDialog } from '../dialogs/ReportSignatureDialog';
import { ReportReleaseDialog } from '../dialogs/ReportReleaseDialog';
import { useNotification } from '../../../infrastructure/notifications/useNotification';
import { usePermission } from '../../../infrastructure/permissions/usePermission';
import { Permission } from '../../../infrastructure/permissions/constants';

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

interface ReportProfileProps {
  reportId: string;
  onBack: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  Draft:               'var(--color-text-secondary)',
  Generated:           '#6366f1',
  'Pending Signature': 'var(--color-status-warning)',
  'Ready For Release': 'orange',
  Released:            'var(--color-status-success)',
  Amended:             '#7c3aed',
  Archived:            'crimson',
};

export const ReportProfile: React.FC<ReportProfileProps> = ({ reportId, onBack }) => {
  const { addToast } = useNotification();
  const { hasPermission } = usePermission();
  const canRelease = hasPermission(Permission.VALIDATE_TECHNICAL);

  const [report, setReport] = useState<LaboratoryReport | null>(null);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [sigOpen, setSigOpen] = useState(false);
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [notesList, setNotesList] = useState<any[]>([
    {
      id: 'N-REP-01',
      author: 'supervisor_user',
      role: 'Clinical Supervisor',
      timestamp: new Date().toISOString(),
      category: 'Clinical',
      content: 'Report draft generated successfully. Awaiting validation signatures.',
    },
  ]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ReportService.getById(reportId);
      setReport(data);
    } catch {
      addToast('error', 'Failed to retrieve report workstation details.');
    } finally {
      setLoading(false);
    }
  }, [reportId, addToast]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleSignSubmit = async (sig: Pick<ReportSignature, 'signer' | 'role'>) => {
    setIsSubmitting(true);
    try {
      const updated = await ReportService.sign(reportId, sig);
      setReport(updated);
      addToast('success', `E-Signature for ${sig.role} applied successfully.`);
    } catch (e: any) {
      addToast('error', e.message || 'Signature application failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignRemove = async (sigId: string) => {
    setIsSubmitting(true);
    try {
      const updated = await ReportService.unsign(reportId, sigId);
      setReport(updated);
      addToast('success', 'E-Signature removed.');
    } catch (e: any) {
      addToast('error', e.message || 'Failed to remove signature.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReleaseSubmit = async (releaseNotes: string, distributionMethods: string[]) => {
    setIsSubmitting(true);
    try {
      const updated = await ReportService.release(reportId, { releaseNotes, distributionMethods });
      setReport(updated);
      addToast('success', `Report successfully released. Dispatched to selected channels.`);
      setReleaseOpen(false);
    } catch (e: any) {
      addToast('error', e.message || 'Report release failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmendmentSubmit = async (amendmentReason: string) => {
    setIsSubmitting(true);
    try {
      const updated = await ReportService.amend(reportId, amendmentReason);
      setReport(updated);
      addToast('success', `Amendment created. Active semantic version incremented.`);
      setReleaseOpen(false);
    } catch (e: any) {
      addToast('error', e.message || 'Failed to initiate amendment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerDistribution = async (method: DistributionRecord['method'], destination: string) => {
    try {
      const updated = await ReportService.distribute(reportId, { method, destination });
      setReport(updated);
      addToast('success', `Report dispatched successfully via ${method}.`);
    } catch (e: any) {
      addToast('error', e.message || 'Report distribution failed.');
    }
  };

  if (loading) {
    return <p style={{ padding: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>Loading report workstation...</p>;
  }

  if (!report) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-status-danger)' }}>Report not found.</p>
        <Button onClick={onBack} variant="outline" style={{ marginTop: '12px' }}>Back to Worklist</Button>
      </div>
    );
  }

  const isReleased = report.status === 'Released';
  const statusColor = STATUS_COLOR[report.status] ?? 'var(--color-text-secondary)';

  // Timeline events mapping: Generated -> Signed -> Released -> Printed -> Distributed -> Amended -> Archived
  const timelineEvents = [
    {
      id: 'TL-REP-1',
      title: 'Report Draft Generated',
      time: report.createdAt,
      severity: 'Info' as const,
      performedBy: 'system',
      role: 'System Engine',
      comments: `Report initialized based on validation ID ${report.approvedResult.validationId}`,
    },
    ...report.signatures.map((s, idx) => ({
      id: `TL-REP-SIG-${idx}`,
      title: `E-Signature Applied: ${s.role}`,
      time: s.timestamp,
      severity: 'Success' as const,
      performedBy: s.signer,
      role: s.role,
      comments: 'Verified signature metadata logged.',
    })),
    ...(report.releasedAt
      ? [
          {
            id: 'TL-REP-RELEASE',
            title: 'Report Released',
            time: report.releasedAt,
            severity: 'Success' as const,
            performedBy: 'supervisor_user',
            role: 'Clinical Supervisor',
            comments: 'Report released and locked.',
          },
        ]
      : []),
    ...report.distributionHistory.map((d, idx) => ({
      id: `TL-REP-DIST-${idx}`,
      title: `Report Distributed via ${d.method}`,
      time: d.timestamp,
      severity: 'Info' as const,
      performedBy: d.initiatedBy,
      role: 'Lab Dispatcher',
      comments: `Destination: ${d.destination} (Status: ${d.status})`,
    })),
  ];

  // Audit list
  const auditRecords = [
    {
      id: 'AUD-REP-1',
      timestamp: report.createdAt,
      performedBy: 'system',
      module: 'Reporting',
      action: 'Report Draft Initialized',
      field: 'Status',
      oldValue: '—',
      newValue: 'Draft',
    },
    ...report.signatures.map((s) => ({
      id: `AUD-REP-SIG-${s.id}`,
      timestamp: s.timestamp,
      performedBy: s.signer,
      module: 'Reporting',
      action: 'E-Signature Attached',
      field: s.role,
      oldValue: '—',
      newValue: 'Signed',
    })),
    ...(report.releasedAt
      ? [
          {
            id: 'AUD-REP-RELEASE',
            timestamp: report.releasedAt,
            performedBy: 'supervisor_user',
            module: 'Reporting',
            action: 'Report Status Released',
            field: 'Status',
            oldValue: 'Pending Signature',
            newValue: 'Released',
          },
        ]
      : []),
  ];

  const tabItems = [
    {
      id: 'preview',
      label: 'Report Preview',
      content: <ReportPreview report={report} />,
    },
    {
      id: 'designer',
      label: 'Designer Configurations',
      content: (
        <ReportDesigner
          initialTemplate={report.template}
          initialSections={report.sections}
          readOnly={isReleased}
          onSave={async (tmpl, sects) => {
            const updated = { ...report, template: tmpl, sections: sects };
            setReport(updated);
          }}
        />
      ),
    },
    {
      id: 'distribution',
      label: 'Controlled Distribution',
      content: (
        <DistributionPanel
          distributionHistory={report.distributionHistory}
          onTriggerDistribution={handleTriggerDistribution}
          readOnly={!isReleased}
        />
      ),
    },
    {
      id: 'versions',
      label: 'Version History',
      content: (
        <div style={{ padding: 'var(--spacing-md)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr>
                <th style={styles.th}>Version Label</th>
                <th style={styles.th}>Initiation Timestamp</th>
                <th style={styles.th}>Amendment Details</th>
                <th style={styles.th}>Authorized Signer</th>
                <th style={styles.th}>Active Status</th>
              </tr>
            </thead>
            <tbody>
              {report.versionHistory.map((v, i) => (
                <tr key={i}>
                  <td style={styles.td}><strong>{v.versionId}</strong></td>
                  <td style={styles.td}>{new Date(v.timestamp).toLocaleString()}</td>
                  <td style={styles.td}>{v.reason ?? 'Initial report draft generation.'}</td>
                  <td style={styles.td}>{v.releasedBy ?? '—'}</td>
                  <td style={styles.td}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600,
                      backgroundColor: v.isActive ? 'rgba(34,197,94,0.06)' : 'var(--color-surface-base)',
                      color: v.isActive ? 'var(--color-status-success)' : 'var(--color-text-secondary)',
                    }}>
                      {v.isActive ? 'Active Copy' : 'Superseded'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: 'timeline',
      label: 'Lifecycle Timeline',
      content: <TimelineViewer events={timelineEvents} />,
    },
    {
      id: 'notes',
      label: 'Notes',
      content: (
        <NotesPanel
          notes={notesList}
          onAddNote={(note) =>
            setNotesList([
              ...notesList,
              {
                id: `N-REP-${notesList.length + 1}`,
                author: 'supervisor_user',
                role: 'Clinical Supervisor',
                timestamp: new Date().toISOString(),
                category: note.category,
                content: note.content,
              },
            ])
          }
        />
      ),
    },
    {
      id: 'attachments',
      label: 'Attachments',
      content: <AttachmentPanel entityId={report.reportId} />,
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
            taskId: report.reportId,
            assignedTo: 'supervisor_user',
            queue: 'Validation',
            priority: 'Routine',
            dueDate: new Date().toISOString(),
          }}
          onUpdateAssignment={() => addToast('success', 'Report queue assignment updated.')}
        />
      ),
    },
  ];

  return (
    <div style={styles.container}>
      {/* Workstation Header */}
      <div style={styles.header}>
        <div>
          <h2 style={{ font: 'var(--type-heading-page)', margin: 0 }}>
            Result Delivery & Reporting: {report.reportId}
          </h2>
          <p style={{ margin: '4px 0 0', font: 'var(--type-body-small)', color: 'var(--color-text-secondary)' }}>
            Patient: <strong>{report.approvedResult.patientName}</strong> &nbsp;|&nbsp;
            Organism: <strong>{report.approvedResult.organismName}</strong> &nbsp;|&nbsp;
            Status: <strong style={{ color: statusColor }}>{report.status}</strong> &nbsp;|&nbsp;
            Active Version: <strong>{report.version}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" onClick={onBack}>Back to Worklist</Button>
          {!isReleased ? (
            <>
              <Button variant="outline" onClick={() => setSigOpen(true)}>
                ✍️ Apply E-Signatures
              </Button>
              {canRelease && (
                <Button variant="solid" onClick={() => setReleaseOpen(true)} style={{ backgroundColor: 'var(--color-status-success)', color: 'white', border: 'none' }}>
                  🚀 Release Report
                </Button>
              )}
            </>
          ) : (
            <Button variant="solid" onClick={() => setReleaseOpen(true)} style={{ backgroundColor: '#7c3aed', color: 'white', border: 'none' }}>
              ⚠️ Amend Report Version
            </Button>
          )}
        </div>
      </div>

      {/* Tabs aggregator */}
      <Card style={{ marginTop: '4px' }}>
        <Tabs items={tabItems} />
      </Card>

      {/* Signature overlay dialog */}
      {sigOpen && (
        <ReportSignatureDialog
          currentSignatures={report.signatures}
          onSubmit={handleSignSubmit}
          onRemove={handleSignRemove}
          onClose={() => setSigOpen(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Release or amendment overlay dialog */}
      {releaseOpen && (
        <ReportReleaseDialog
          report={report}
          onConfirmRelease={handleReleaseSubmit}
          onConfirmAmendment={handleAmendmentSubmit}
          onClose={() => setReleaseOpen(false)}
          isSubmitting={isSubmitting}
        />
      )}
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
  th: {
    textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--color-border-default)',
    color: 'var(--color-text-secondary)', fontWeight: 700,
  },
  td: { padding: '6px 8px', borderBottom: '1px solid var(--color-border-default)' },
};

export default ReportProfile;
