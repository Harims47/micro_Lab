import React, { useState, useEffect, useCallback } from 'react';
import type { Colony } from '../models/types';
import { OrganismService } from '../services/organismService';
import { useNotification } from '../../../infrastructure/notifications/useNotification';
import { usePermission } from '../../../infrastructure/permissions/usePermission';
import { Permission } from '../../../infrastructure/permissions/constants';

import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { Tabs } from '../../../components/Layout/Tabs';
import { IdentificationReviewDialog } from '../dialogs/IdentificationReviewDialog';
import {
  AttachmentPanel,
  TimelineViewer,
  AuditViewer,
  NotesPanel,
  TaskAssignmentPanel,
} from '../../../components/Laboratory';

interface OrganismProfileProps {
  colonyId: string;
  onBack: () => void;
}

export const OrganismProfile: React.FC<OrganismProfileProps> = ({ colonyId, onBack }) => {
  const { addToast } = useNotification();
  const { hasPermission } = usePermission();
  const canReview = hasPermission(Permission.VALIDATE_TECHNICAL); // mapped ID supervisor review
  const canSendAST = hasPermission(Permission.RECORD_AST_RESULT); // mapped AST enqueue

  const [colony, setColony] = useState<Colony | null>(null);
  const [loading, setLoading] = useState(true);

  // Review states
  const [reviewAttemptId, setReviewAttemptId] = useState<string | null>(null);

  // Notes state
  const [notesList, setNotesList] = useState<any[]>([
    {
      id: 'N-01',
      author: 'tech_user',
      role: 'Technician',
      timestamp: new Date().toISOString(),
      category: 'Laboratory',
      content: 'Gram negative rods isolated on Blood Agar. Inoculated VITEK card.',
    },
  ]);

  const fetchColony = useCallback(async () => {
    setLoading(true);
    try {
      const c = await OrganismService.getColonyById(colonyId);
      setColony(c);
    } catch {
      addToast('error', 'Failed to retrieve colony profile.');
    } finally {
      setLoading(false);
    }
  }, [colonyId, addToast]);

  useEffect(() => {
    fetchColony();
  }, [fetchColony]);

  if (loading) {
    return <p style={{ font: 'var(--type-body-default)', color: 'var(--color-text-secondary)' }}>Loading colony profile...</p>;
  }

  if (!colony) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
        <p style={{ font: 'var(--type-body-default)', color: 'var(--color-status-danger)' }}>Colony record not found.</p>
        <Button onClick={onBack} variant="outline" style={{ marginTop: '12px' }}>
          Back to Directory
        </Button>
      </div>
    );
  }

  const handleReviewSubmit = async (review: { status: 'Approved' | 'Rejected'; reason?: string; reviewer: string }) => {
    if (!reviewAttemptId) return;
    try {
      await OrganismService.reviewAttempt(colony.colonyId, reviewAttemptId, review);
      addToast('success', `Identification attempt ${review.status.toLowerCase()} successfully.`);
      setReviewAttemptId(null);
      fetchColony();
    } catch {
      addToast('error', 'Failed to save clinical review decision.');
    }
  };

  const handleSendAST = async () => {
    try {
      await OrganismService.sendToAstQueue(colony.colonyId);
      addToast('success', 'Colony successfully sent to AST testing queue.');
      fetchColony();
    } catch {
      addToast('error', 'Failed to request AST Susceptibility panels.');
    }
  };

  // Timeline events mapping
  const timelineEvents = [
    {
      id: 'TL-1',
      title: 'Colony Isolated',
      time: new Date().toISOString(),
      severity: 'Info' as const,
      performedBy: 'Sarah Connor',
      role: 'Lab Technician',
      comments: 'Observed circular convex morphologic colonies.',
    },
    ...(colony.gramStain
      ? [
          {
            id: 'TL-2',
            title: 'Gram Stain Completed',
            time: colony.gramStain.timestamp,
            severity: 'Success' as const,
            performedBy: colony.gramStain.technician,
            role: 'Lab Technician',
            comments: `Stained: ${colony.gramStain.reaction} (${colony.gramStain.shape})`,
          },
        ]
      : []),
    ...colony.attempts.map((a) => ({
      id: `TL-ATT-${a.attemptId}`,
      title: `Identification Attempt #${a.attemptNumber} logged`,
      time: a.timestamp,
      severity: a.status === 'Approved' ? ('Success' as const) : a.status === 'Rejected' ? ('Critical' as const) : ('Warning' as const),
      performedBy: a.performedBy,
      role: 'Lab Technician',
      comments: `Target: ${a.organismName} via ${a.method} (${a.confidence.instrumentConfidence.toFixed(1)}% match)`,
    })),
  ];

  // Auditing records mapping
  const auditRecords = colony.attempts.map((a) => ({
    id: `AUD-${a.attemptId}`,
    timestamp: a.timestamp,
    performedBy: a.performedBy,
    module: 'Organism ID',
    action: `Attempt #${a.attemptNumber} Recorded`,
    field: 'ApprovedTaxon',
    oldValue: 'None',
    newValue: a.organismName,
    reason: a.reasonForChange,
  }));

  // Reassignments SLA task config
  const mockTask = {
    taskId: colony.colonyId,
    assignedTo: 'tech_user',
    queue: 'AST Queue' as const,
    priority: 'Urgent' as const,
    dueDate: new Date().toISOString(),
  };

  const tabItems = [
    {
      id: 'timeline',
      label: 'Chain of Custody Timeline',
      content: <TimelineViewer events={timelineEvents} />,
    },
    {
      id: 'attachments',
      label: 'microscope Photos',
      content: <AttachmentPanel entityId={colony.colonyId} />,
    },
    {
      id: 'notes',
      label: 'Colony Notes feed',
      content: (
        <NotesPanel
          notes={notesList}
          onAddNote={(note) => {
            setNotesList([
              ...notesList,
              {
                id: `N-${notesList.length + 1}`,
                author: 'tech_user',
                role: 'Technician',
                timestamp: new Date().toISOString(),
                category: note.category,
                content: note.content,
                mentions: note.mentions,
              },
            ]);
          }}
        />
      ),
    },
    {
      id: 'audits',
      label: 'System Audit Logs',
      content: <AuditViewer audits={auditRecords} />,
    },
    {
      id: 'assignment',
      label: 'Task Assignment',
      content: (
        <TaskAssignmentPanel
          task={mockTask}
          onUpdateAssignment={(upd) => {
            addToast('success', `Technician pool reallocated to ${upd.assignedTo || 'Unassigned'}.`);
          }}
        />
      ),
    },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={{ font: 'var(--type-heading-page)', margin: 0 }}>Colony Profile: {colony.colonyId}</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-secondary)', font: 'var(--type-body-small)' }}>
            Parent Plate: {colony.plateBarcode} | Culture: {colony.cultureAccession} | Status: <strong>{colony.status}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" onClick={onBack}>
            Back to Directory
          </Button>
          {colony.status === 'Identified' && canSendAST && (
            <Button variant="solid" onClick={handleSendAST}>
              Enqueue to AST Susceptibility
            </Button>
          )}
        </div>
      </div>

      <div style={styles.grid}>
        {/* Morphology specs */}
        <Card style={styles.detailsCard}>
          <h4 style={styles.cardTitle}>Morphology & Reactions</h4>
          <div style={styles.detailsBody}>
            <p>Morphology: <strong>{colony.morphology}</strong></p>
            <p>Colony Color: <strong>{colony.color}</strong></p>
            <p>Hemolysis: <strong>{colony.hemolysis}</strong></p>
            
            {colony.gramStain ? (
              <div style={styles.stainHighlight}>
                <strong>Gram Stain Result:</strong>
                <p style={{ margin: '4px 0 0 0', color: colony.gramStain.reaction === 'Gram Positive' ? 'purple' : '#e67e22', fontWeight: 'bold' }}>
                  {colony.gramStain.reaction} ({colony.gramStain.shape})
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.72rem', color: 'gray' }}>Arrangement: {colony.gramStain.arrangement}</p>
              </div>
            ) : (
              <p style={{ fontStyle: 'italic', color: 'gray' }}>No Gram stain results.</p>
            )}
          </div>
        </Card>

        {/* Biochemical assays */}
        <Card style={styles.detailsCard}>
          <h4 style={styles.cardTitle}>Biochemical Assays</h4>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Assay</th>
                  <th style={styles.th}>Result</th>
                </tr>
              </thead>
              <tbody>
                {colony.biochemicals.length === 0 ? (
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'center', color: 'gray', padding: '8px' }}>No biochemical tests performed.</td>
                  </tr>
                ) : (
                  colony.biochemicals.map((t) => (
                    <tr key={t.testName}>
                      <td style={styles.td}>{t.testName}</td>
                      <td style={styles.td}><strong>{t.result}</strong></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Identification Attempts */}
        <Card style={{ ...styles.detailsCard, gridColumn: 'span 2' }}>
          <h4 style={styles.cardTitle}>Taxonomic Identification Attempts</h4>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Attempt</th>
                  <th style={styles.th}>Organism Target</th>
                  <th style={styles.th}>Method</th>
                  <th style={styles.th}>Match %</th>
                  <th style={styles.th}>Review Status</th>
                  <th style={styles.th}>Clinical Action</th>
                </tr>
              </thead>
              <tbody>
                {colony.attempts.map((a) => (
                  <tr key={a.attemptId}>
                    <td style={styles.td}>#{a.attemptNumber}</td>
                    <td style={styles.td}><strong>{a.organismName}</strong></td>
                    <td style={styles.td}>{a.method}</td>
                    <td style={styles.td}>{a.confidence.instrumentConfidence.toFixed(1)}%</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          fontWeight: 'bold',
                          color: a.status === 'Approved' ? 'green' : a.status === 'Rejected' ? 'red' : 'orange',
                        }}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {a.status === 'Pending Verification' && canReview && (
                        <Button variant="outline" onClick={() => setReviewAttemptId(a.attemptId)}>
                          Review Checkpoint
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card style={{ marginTop: 'var(--spacing-md)' }}>
        <Tabs items={tabItems} />
      </Card>

      {/* Review Dialog */}
      {reviewAttemptId && (
        <IdentificationReviewDialog
          onClose={() => setReviewAttemptId(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: 'var(--spacing-sm)',
    flexWrap: 'wrap',
    gap: '8px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--spacing-md)',
  },
  detailsCard: {
    padding: 'var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  },
  cardTitle: {
    font: 'var(--type-heading-item)',
    margin: 0,
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: '4px',
  },
  detailsBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '0.85rem',
  },
  stainHighlight: {
    backgroundColor: 'var(--color-surface-base)',
    padding: '8px',
    borderRadius: '4px',
    borderLeft: '4px solid var(--color-brand-primary)',
    marginTop: '6px',
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
};
export default OrganismProfile;
