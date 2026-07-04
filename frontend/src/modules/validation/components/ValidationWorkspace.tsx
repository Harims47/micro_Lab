import React, { useState } from 'react';
import type { ValidationRecord, ValidationStage } from '../models/types';
import { ValidationService } from '../services/validationService';
import { ValidationValidator } from '../validators/validationValidator';
import { ValidationReviewDialog } from '../dialogs/ValidationReviewDialog';
import { useNotification } from '../../../infrastructure/notifications/useNotification';
import { usePermission } from '../../../infrastructure/permissions/usePermission';
import { Permission } from '../../../infrastructure/permissions/constants';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';

interface ValidationWorkspaceProps {
  record: ValidationRecord;
  onRecordUpdate: (updated: ValidationRecord) => void;
}

const STAGE_COLOR: Record<string, string> = {
  Approved: 'var(--color-status-success)',
  Rejected: 'var(--color-status-danger)',
  'Returned For Correction': 'orange',
  Pending: 'var(--color-text-secondary)',
};

const STAGE_ICON: Record<string, string> = {
  Approved: '✅',
  Rejected: '❌',
  'Returned For Correction': '↩️',
  Pending: '⏳',
};

export const ValidationWorkspace: React.FC<ValidationWorkspaceProps> = ({
  record,
  onRecordUpdate,
}) => {
  const { addToast } = useNotification();
  const { hasPermission } = usePermission();

  const [activeStage, setActiveStage] = useState<ValidationStage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  const isFinallyApproved = record.status === 'Approved' || record.status === 'Released For Reporting';

  const handleOpenReview = (stage: ValidationStage) => {
    const notFinal = ValidationValidator.validateNotFinallyApproved(record);
    if (!notFinal.isValid) { addToast('error', notFinal.error!); return; }

    const notDuplicate = ValidationValidator.validateNotAlreadyApproved(stage);
    if (!notDuplicate.isValid) { addToast('warning', notDuplicate.error!); return; }

    const orderCheck = ValidationValidator.validateStageOrder(record, stage.type);
    if (!orderCheck.isValid) { addToast('error', orderCheck.error!); return; }

    setActiveStage(stage);
  };

  const handleDecisionSubmit = async (decisionData: any) => {
    if (!activeStage) return;
    setIsSubmitting(true);
    try {
      const updated = await ValidationService.submitDecision(
        record.validationId,
        activeStage.stageId,
        decisionData
      );
      onRecordUpdate(updated);
      addToast('success', `${activeStage.type}: ${decisionData.decision} recorded.`);
      setActiveStage(null);
    } catch (e: any) {
      addToast('error', e.message || 'Decision submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRelease = async () => {
    try {
      const updated = await ValidationService.release(record.validationId);
      onRecordUpdate(updated);
      addToast('success', 'Record released for reporting. Sprint 12 handoff complete.');
    } catch (e: any) {
      addToast('error', e.message || 'Release failed.');
    }
  };

  const completedCount = record.summary.completedStages;
  const totalCount = record.summary.totalStages;

  return (
    <Card style={styles.container}>
      {/* Summary header */}
      <div style={styles.summaryRow}>
        <div>
          <h4 style={{ font: 'var(--type-heading-item)', margin: 0 }}>Validation Stages</h4>
          <p style={{ margin: '4px 0 0', font: 'var(--type-body-small)', color: 'var(--color-text-secondary)' }}>
            {completedCount} / {totalCount} stages completed &nbsp;|&nbsp;
            <strong>{record.summary.overallProgress}%</strong> overall progress
          </p>
        </div>

        {/* AST / Organism summary pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={styles.infoPill}>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.72rem' }}>AST</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.82rem' }}>{record.astId}</span>
          </div>
          <div style={styles.infoPill}>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.72rem' }}>Organism</span>
            <strong style={{ fontSize: '0.82rem' }}>{record.organismName}</strong>
          </div>
          <div style={styles.infoPill}>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.72rem' }}>Priority</span>
            <strong style={{ fontSize: '0.82rem', color: record.priority === 'Stat' ? '#dc2626' : record.priority === 'Urgent' ? 'orange' : 'inherit' }}>
              {record.priority}
            </strong>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'var(--color-border-default)', overflow: 'hidden' }}>
        <div style={{
          width: `${record.summary.overallProgress}%`,
          height: '100%',
          backgroundColor: record.summary.overallProgress === 100 ? 'var(--color-status-success)' : 'var(--color-brand-primary)',
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Stage cards */}
      <div style={styles.stageList}>
        {record.stages.map((stage, idx) => {
          const isOpen = expandedStage === stage.stageId;
          const color = STAGE_COLOR[stage.status] ?? 'var(--color-text-secondary)';
          const icon = STAGE_ICON[stage.status] ?? '⏳';
          const isEditable = stage.status === 'Pending' && !isFinallyApproved;

          return (
            <div key={stage.stageId} style={{ ...styles.stageCard, borderLeftColor: color }}>
              <div style={styles.stageHeader} onClick={() => setExpandedStage(isOpen ? null : stage.stageId)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%', backgroundColor: `${color}20`, color, fontWeight: 700, fontSize: '0.78rem' }}>
                    {idx + 1}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{stage.type}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                      {stage.assignment ? `Assigned to: ${stage.assignment.assignedTo}` : 'Unassigned'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color }}>{icon} {stage.status}</span>
                  {isEditable && hasPermission(Permission.VALIDATE_TECHNICAL) && (
                    <Button
                      variant="outline"
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleOpenReview(stage); }}
                      style={{ padding: '4px 12px', fontSize: '0.78rem', height: '28px' }}
                    >
                      Submit Review
                    </Button>
                  )}
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{isOpen ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={styles.stageDetail}>
                  {stage.decision ? (
                    <>
                      <div style={styles.detailGrid}>
                        <div><span style={styles.detailLabel}>Reviewer</span><span>{stage.decision.reviewer}</span></div>
                        <div><span style={styles.detailLabel}>Date</span><span>{new Date(stage.decision.timestamp).toLocaleString()}</span></div>
                        <div><span style={styles.detailLabel}>Electronic Approval</span>
                          <span style={{ color: stage.decision.electronicApprovalFlag ? 'var(--color-status-success)' : 'var(--color-text-secondary)' }}>
                            {stage.decision.electronicApprovalFlag ? '✅ Confirmed' : '—'}
                          </span>
                        </div>
                        {stage.decision.digitalSignaturePlaceholder && (
                          <div><span style={styles.detailLabel}>Digital Signature</span>
                            <code style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                              {stage.decision.digitalSignaturePlaceholder}
                            </code>
                          </div>
                        )}
                      </div>
                      {stage.decision.findings && (
                        <div style={{ marginTop: '8px' }}>
                          <span style={styles.detailLabel}>Findings:</span>
                          <p style={{ margin: '4px 0 0', fontSize: '0.82rem' }}>{stage.decision.findings}</p>
                        </div>
                      )}
                      <div style={{ marginTop: '6px' }}>
                        <span style={styles.detailLabel}>Comments:</span>
                        <p style={{ margin: '4px 0 0', fontSize: '0.82rem' }}>{stage.decision.comments || '—'}</p>
                      </div>
                    </>
                  ) : (
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem', margin: 0 }}>
                      No decision submitted yet for this stage.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Release button — only after full approval */}
      {record.status === 'Approved' && (
        <div style={styles.releasePanel}>
          <div>
            <h4 style={{ margin: '0 0 4px' }}>✅ All Validation Stages Approved</h4>
            <p style={{ margin: 0, font: 'var(--type-body-small)', color: 'var(--color-text-secondary)' }}>
              This case is ready to be released for Sprint 12 Reporting.
            </p>
          </div>
          <Button
            variant="solid"
            onClick={handleRelease}
            style={{ backgroundColor: '#0891b2', color: 'white' }}
          >
            🚀 Release For Reporting
          </Button>
        </div>
      )}

      {record.status === 'Released For Reporting' && (
        <div style={{ ...styles.releasePanel, backgroundColor: 'rgba(8,145,178,0.06)', borderColor: '#0891b2' }}>
          <p style={{ margin: 0, fontWeight: 600, color: '#0891b2' }}>
            🏁 This record has been released for reporting. Sprint 12 handoff complete.
          </p>
        </div>
      )}

      {/* Review dialog */}
      {activeStage && (
        <ValidationReviewDialog
          stage={activeStage}
          onSubmit={handleDecisionSubmit}
          onClose={() => setActiveStage(null)}
          isSubmitting={isSubmitting}
        />
      )}
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 'var(--spacing-md)',
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)',
  },
  summaryRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px',
  },
  infoPill: {
    display: 'flex', flexDirection: 'column', gap: '2px',
    padding: '6px 12px', borderRadius: '6px',
    backgroundColor: 'var(--color-surface-base)',
    border: '1px solid var(--color-border-default)',
  },
  stageList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  stageCard: {
    border: '1px solid var(--color-border-default)',
    borderLeft: '4px solid',
    borderRadius: '6px',
    overflow: 'hidden',
    backgroundColor: 'var(--color-surface-raised)',
  },
  stageHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', cursor: 'pointer',
    flexWrap: 'wrap', gap: '8px',
  },
  stageDetail: {
    padding: '12px 14px',
    borderTop: '1px solid var(--color-border-default)',
    backgroundColor: 'var(--color-surface-base)',
  },
  detailGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '6px',
  },
  detailLabel: {
    display: 'block', fontSize: '0.72rem', fontWeight: 700,
    color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em',
    marginBottom: '2px',
  },
  releasePanel: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 16px', borderRadius: '8px',
    backgroundColor: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.3)',
    flexWrap: 'wrap', gap: '12px',
  },
};

export default ValidationWorkspace;
