import React, { useState } from 'react';
import type { QCSample } from '../models/types';
import { QcService } from '../services/qcService';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { useNotification } from '../../../infrastructure/notifications/useNotification';
import { Tabs } from '../../../components/Layout/Tabs';
import {
  AttachmentPanel,
  TimelineViewer,
  NotesPanel,
  TaskAssignmentPanel,
} from '../../../components/Laboratory';

interface QCProfileProps {
  sample: QCSample;
  onBack: () => void;
  onRefresh: () => void;
}

export const QCProfile: React.FC<QCProfileProps> = ({ sample, onBack, onRefresh }) => {
  const { addToast } = useNotification();
  const [findings, setFindings] = useState(sample.findings || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [notesList, setNotesList] = useState<any[]>([
    {
      id: 'N-QC-01',
      author: 'tech_user',
      role: 'Laboratory Technologist',
      timestamp: new Date().toISOString(),
      category: 'QC',
      content: `QC sample initialized for control strain ${sample.controlStrain}.`,
    },
  ]);

  const handleUpdateStatus = async (status: QCSample['status']) => {
    setIsSubmitting(true);
    try {
      await QcService.updateSampleStatus(sample.sampleId, status, findings);
      addToast('success', `QC Status updated to ${status}.`);
      onRefresh();
      onBack();
    } catch {
      addToast('error', 'Failed to update QC status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const timelineEvents = [
    {
      id: 'T-QC-1',
      title: 'QC Sample Scheduled',
      time: sample.scheduledDate,
      severity: 'Info' as const,
      performedBy: 'supervisor_user',
      role: 'Supervisor',
      comments: `Control strain: ${sample.controlStrain} (Lot: ${sample.lotNumber})`,
    },
    ...(sample.collectedDate
      ? [
          {
            id: 'T-QC-2',
            title: 'Sample Collected',
            time: sample.collectedDate,
            severity: 'Info' as const,
            performedBy: sample.technician ?? 'tech_user',
            role: 'Technician',
            comments: 'Physical container logged in.',
          },
        ]
      : []),
    ...(sample.verifiedDate
      ? [
          {
            id: 'T-QC-3',
            title: `QC Verification: ${sample.status}`,
            time: sample.verifiedDate,
            severity: sample.status === 'Passed' ? ('Success' as const) : ('Critical' as const),
            performedBy: sample.technician ?? 'tech_user',
            role: 'Supervisor',
            comments: sample.findings,
          },
        ]
      : []),
  ];

  const tabItems = [
    {
      id: 'workspace',
      label: 'Intake Workspace',
      content: (
        <div style={styles.workspace}>
          <div style={styles.detailGrid}>
            <div><strong>Control Strain:</strong> <span>{sample.controlStrain}</span></div>
            <div><strong>Target Taxon:</strong> <span>{sample.targetOrganism}</span></div>
            <div><strong>Lot Reference:</strong> <span>{sample.lotNumber}</span></div>
            <div><strong>Scheduled Run:</strong> <span>{sample.scheduledDate}</span></div>
          </div>

          {['Scheduled', 'Collected', 'Processed', 'Verified'].includes(sample.status) && (
            <div style={{ marginTop: '12px', borderTop: '1px solid var(--color-border-default)', paddingTop: '12px' }}>
              <label className="lims-form-label" style={{ display: 'block', marginBottom: '6px' }}>QC Observations & Findings</label>
              <textarea
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                placeholder="Log observed zone diameters or MIC measurements here..."
                style={{ width: '100%', height: '80px', boxSizing: 'border-box', padding: '8px' }}
              />

              <div style={styles.actionRow}>
                {sample.status === 'Scheduled' && (
                  <Button variant="solid" onClick={() => handleUpdateStatus('Collected')} disabled={isSubmitting}>
                    Collect Sample
                  </Button>
                )}
                {sample.status === 'Collected' && (
                  <Button variant="solid" onClick={() => handleUpdateStatus('Processed')} disabled={isSubmitting}>
                    Mark Processed
                  </Button>
                )}
                {sample.status === 'Processed' && (
                  <Button variant="solid" onClick={() => handleUpdateStatus('Verified')} disabled={isSubmitting}>
                    Mark Verified
                  </Button>
                )}
                {sample.status === 'Verified' && (
                  <>
                    <Button variant="solid" onClick={() => handleUpdateStatus('Passed')} disabled={isSubmitting} style={{ backgroundColor: 'var(--color-status-success)', color: 'white', border: 'none' }}>
                      Pass Control
                    </Button>
                    <Button variant="solid" onClick={() => handleUpdateStatus('Failed')} disabled={isSubmitting} style={{ backgroundColor: 'var(--color-status-danger)', color: 'white', border: 'none' }}>
                      Fail Control
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {(sample.status === 'Passed' || sample.status === 'Failed') && (
            <div style={{ ...styles.findingsPill, backgroundColor: sample.status === 'Passed' ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)', borderColor: sample.status === 'Passed' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)' }}>
              <strong>QC Run Conclusion: {sample.status}</strong>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem' }}>{sample.findings || 'No notes documented.'}</p>
            </div>
          )}
        </div>
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
            setNotesList([
              ...notesList,
              {
                id: `N-QC-${notesList.length + 1}`,
                author: 'tech_user',
                role: 'Laboratory Technologist',
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
      content: <AttachmentPanel entityId={sample.sampleId} />,
    },
    {
      id: 'tasks',
      label: 'Tasks',
      content: (
        <TaskAssignmentPanel
          task={{
            taskId: sample.sampleId,
            assignedTo: sample.technician ?? 'Unassigned',
            queue: 'Validation',
            priority: 'Routine',
            dueDate: new Date().toISOString(),
          }}
          onUpdateAssignment={() => addToast('success', 'QC task assignment updated.')}
        />
      ),
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={{ font: 'var(--type-heading-page)', margin: 0 }}>QC Run Workstation: {sample.sampleId}</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Strain: <strong>{sample.controlStrain}</strong> &nbsp;|&nbsp; Status: <strong>{sample.status}</strong>
          </span>
        </div>
        <Button variant="outline" onClick={onBack}>Back to Worklist</Button>
      </div>

      <Card style={{ marginTop: '12px' }}>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-default)', paddingBottom: '10px' },
  workspace: { padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: '12px' },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem' },
  actionRow: { display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' },
  findingsPill: { padding: '12px', borderRadius: '6px', border: '1px solid', marginTop: '10px' },
};

export default QCProfile;
