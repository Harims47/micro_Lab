import React, { useState, useEffect, useCallback } from 'react';
import type { AstResult } from '../models/types';
import { AstService } from '../services/astService';
import { AstValidator } from '../validators/astValidator';
import { useNotification } from '../../../infrastructure/notifications/useNotification';
import { usePermission } from '../../../infrastructure/permissions/usePermission';
import { Permission } from '../../../infrastructure/permissions/constants';

import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { Tabs } from '../../../components/Layout/Tabs';
import { AstWorksheet } from './AstWorksheet';
import {
  AttachmentPanel,
  TimelineViewer,
  AuditViewer,
  NotesPanel,
  TaskAssignmentPanel,
} from '../../../components/Laboratory';

interface AstProfileProps {
  astId: string;
  onBack: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  'Approved': 'var(--color-status-success)',
  'Rejected': 'var(--color-status-danger)',
  'Pending Technical Review': 'orange',
  'In Testing': 'var(--color-status-warning)',
  'Returned For Correction': 'crimson',
};

export const AstProfile: React.FC<AstProfileProps> = ({ astId, onBack }) => {
  const { addToast } = useNotification();
  const { hasPermission } = usePermission();
  const canReview = hasPermission(Permission.VALIDATE_TECHNICAL);

  const [ast, setAst] = useState<AstResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Review dialog state
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'Approved' | 'Rejected' | 'Returned For Correction'>('Approved');
  const [reviewReason, setReviewReason] = useState('');

  // Notes
  const [notesList, setNotesList] = useState<any[]>([
    {
      id: 'N-AST-01',
      author: 'tech_user',
      role: 'Technician',
      timestamp: new Date().toISOString(),
      category: 'Laboratory',
      content: 'Standard gram-negative panel inoculated per SOP-MB-012.',
    },
  ]);

  const fetchAst = useCallback(async () => {
    setLoading(true);
    try {
      const result = await AstService.getAstById(astId);
      setAst(result);
    } catch {
      addToast('error', 'Failed to load AST profile.');
    } finally {
      setLoading(false);
    }
  }, [astId, addToast]);

  useEffect(() => {
    fetchAst();
  }, [fetchAst]);

  const handleSaveWorksheet = async (results: any[]) => {
    if (!ast) return;

    const validation = AstValidator.validate({ ...ast, agentResults: results });
    if (!validation.isValid) {
      addToast('error', validation.error ?? 'Validation failed.');
      return;
    }
    try {
      await AstService.saveAstResult(ast.astId, results);
      addToast('success', 'AST worksheet updated successfully.');
      fetchAst();
    } catch {
      addToast('error', 'Failed to save AST results.');
    }
  };

  const handleReviewSubmit = async () => {
    if (!ast) return;

    const segregation = AstValidator.validateReviewer(ast.performedBy, 'supervisor_user');
    if (!segregation.isValid) {
      addToast('error', segregation.error ?? 'Reviewer validation failed.');
      return;
    }

    if ((reviewStatus === 'Rejected' || reviewStatus === 'Returned For Correction') && !reviewReason.trim()) {
      addToast('error', 'Justification is required for rejection or correction.');
      return;
    }

    try {
      await AstService.reviewAstResult(ast.astId, {
        status: reviewStatus,
        reason: reviewReason,
        reviewer: 'supervisor_user',
      });
      addToast('success', `AST ${reviewStatus.toLowerCase()} successfully.`);
      setReviewOpen(false);
      fetchAst();
    } catch {
      addToast('error', 'Failed to submit review decision.');
    }
  };

  if (loading) {
    return <p style={{ padding: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>Loading AST profile...</p>;
  }

  if (!ast) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-status-danger)' }}>AST record not found.</p>
        <Button onClick={onBack} variant="outline" style={{ marginTop: '12px' }}>Back to Worklist</Button>
      </div>
    );
  }

  const statusColor = STATUS_COLOR[ast.status] ?? 'var(--color-text-secondary)';

  // Timeline events
  const timelineEvents = [
    {
      id: 'TL-AST-1',
      title: 'AST Record Created',
      time: ast.timestamp,
      severity: 'Info' as const,
      performedBy: ast.performedBy,
      role: 'Lab Technician',
      comments: `Panel created for ${ast.organismName} — ${ast.guideline}`,
    },
    ...(ast.status === 'Approved' || ast.status === 'Rejected'
      ? [{
          id: 'TL-AST-2',
          title: `AST ${ast.status}`,
          time: ast.reviewTimestamp ?? new Date().toISOString(),
          severity: ast.status === 'Approved' ? ('Success' as const) : ('Critical' as const),
          performedBy: ast.reviewedBy ?? 'supervisor_user',
          role: 'Clinical Supervisor',
          comments: ast.status,
        }]
      : []),
  ];

  // Audit records
  const auditRecords = [
    {
      id: `AUD-AST-1`,
      timestamp: ast.timestamp,
      performedBy: ast.performedBy,
      module: 'AST',
      action: 'AST Record Created',
      field: 'Status',
      oldValue: '—',
      newValue: 'Created',
    },
    ...(ast.reviewedBy ? [{
      id: `AUD-AST-2`,
      timestamp: ast.reviewTimestamp ?? '',
      performedBy: ast.reviewedBy,
      module: 'AST',
      action: `AST ${ast.status}`,
      field: 'Status',
      oldValue: 'Pending Technical Review',
      newValue: ast.status,
    }] : []),
  ];

  const isEditable = ['Created', 'Panel Assigned', 'In Testing', 'Returned For Correction'].includes(ast.status);
  const isPendingReview = ast.status === 'Pending Technical Review' || ast.status === 'Testing Completed';

  const tabItems = [
    {
      id: 'results',
      label: 'AST Results',
      content: (
        <AstWorksheet
          agents={ast.agentResults}
          guideline={ast.guideline}
          readOnly={!isEditable}
          onSave={isEditable ? handleSaveWorksheet : undefined}
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
              id: `N-AST-${notesList.length + 1}`,
              author: 'tech_user',
              role: 'Technician',
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
      content: <AttachmentPanel entityId={ast.astId} />,
    },
    {
      id: 'audits',
      label: 'Audit Log',
      content: <AuditViewer audits={auditRecords} />,
    },
    {
      id: 'tasks',
      label: 'Task Assignment',
      content: (
        <TaskAssignmentPanel
          task={{ taskId: ast.astId, assignedTo: 'tech_user', queue: 'AST Queue', priority: 'Urgent', dueDate: new Date().toISOString() }}
          onUpdateAssignment={(upd) => addToast('success', `Reassigned to ${upd.assignedTo || 'Unassigned'}.`)}
        />
      ),
    },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={{ font: 'var(--type-heading-page)', margin: 0 }}>AST Worksheet: {ast.astId}</h2>
          <p style={{ margin: '4px 0 0 0', font: 'var(--type-body-small)', color: 'var(--color-text-secondary)' }}>
            Colony: <strong>{ast.colonyId}</strong> &nbsp;|&nbsp;
            Organism: <strong>{ast.organismName}</strong> &nbsp;|&nbsp;
            Status: <strong style={{ color: statusColor }}>{ast.status}</strong> &nbsp;|&nbsp;
            Guideline: <strong>{ast.guideline}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" onClick={onBack}>Back to Worklist</Button>
          {isPendingReview && canReview && (
            <Button variant="solid" onClick={() => setReviewOpen(true)}>
              Technical Review
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Card style={{ marginTop: 'var(--spacing-sm)' }}>
        <Tabs items={tabItems} />
      </Card>

      {/* Review Overlay */}
      {reviewOpen && (
        <div style={styles.overlay}>
          <Card style={styles.reviewModal}>
            <h3 style={{ margin: '0 0 var(--spacing-md) 0', font: 'var(--type-heading-subsection)' }}>
              Technical Review — AST Validation
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              <div>
                <label className="lims-form-label" style={{ display: 'block', marginBottom: '6px' }}>Review Decision</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value as any)}
                  className="lims-input"
                  style={{ width: '100%', height: '36px' }}
                >
                  <option value="Approved">Approve — AST Results Verified</option>
                  <option value="Rejected">Reject — Results Invalidated</option>
                  <option value="Returned For Correction">Return for Correction</option>
                </select>
              </div>
              <div>
                <label className="lims-form-label" style={{ display: 'block', marginBottom: '6px' }}>
                  Justification {(reviewStatus !== 'Approved') ? '(Required)' : '(Optional)'}
                </label>
                <textarea
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  className="lims-input"
                  placeholder="e.g. Zone diameters verified against CLSI M100 breakpoints..."
                  style={{ width: '100%', height: '80px', resize: 'vertical', boxSizing: 'border-box', padding: '8px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--color-border-default)', paddingTop: '12px' }}>
                <Button variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button>
                <Button
                  variant="solid"
                  onClick={handleReviewSubmit}
                  style={{
                    backgroundColor: reviewStatus === 'Approved' ? 'var(--color-status-success)' : 'var(--color-status-danger)',
                    color: 'white',
                  }}
                >
                  Confirm Review Decision
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: 'var(--spacing-sm)', flexWrap: 'wrap', gap: '8px',
  },
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
  },
  reviewModal: { width: '460px', padding: 'var(--spacing-lg)', boxShadow: 'var(--elevation-3)' },
};

export default AstProfile;
