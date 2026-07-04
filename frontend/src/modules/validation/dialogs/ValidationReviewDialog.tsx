import React, { useState } from 'react';
import type { ValidationStage, ValidationDecisionType } from '../models/types';
import { ValidationValidator } from '../validators/validationValidator';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';

interface ReviewDialogProps {
  stage: ValidationStage;
  performedBy?: string;
  onSubmit: (decision: {
    decision: ValidationDecisionType;
    comments: string;
    findings: string;
    electronicApprovalFlag: boolean;
    reviewer: string;
  }) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

export const ValidationReviewDialog: React.FC<ReviewDialogProps> = ({
  stage,
  performedBy = 'tech_user',
  onSubmit,
  onClose,
  isSubmitting = false,
}) => {
  const [decision, setDecision] = useState<ValidationDecisionType>('Approved');
  const [comments, setComments] = useState('');
  const [findings, setFindings] = useState('');
  const [electronicApproval, setElectronicApproval] = useState(false);
  const [reviewer, setReviewer] = useState('supervisor_user');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const REVIEWERS = [
    { value: 'supervisor_user',    label: 'Supervisor — Dr. Smith' },
    { value: 'dr_chen',            label: 'Dr. Chen — Clinical Microbiologist' },
    { value: 'dr_patel',           label: 'Dr. Patel — Pathologist' },
    { value: 'dr_kim',             label: 'Dr. Kim — Lab Director' },
    { value: 'lab_director',       label: 'Lab Director — Prof. Johnson' },
    { value: 'pathologist_user',   label: 'Dr. Rodriguez — Pathologist' },
  ];

  const validate = () => {
    const errors: string[] = [];

    const segResult = ValidationValidator.validateSegregation(performedBy, reviewer);
    if (!segResult.isValid) errors.push(segResult.error!);

    const commentResult = ValidationValidator.validateDecisionComment(
      decision as 'Approved' | 'Rejected' | 'Returned For Correction',
      comments
    );
    if (!commentResult.isValid) errors.push(commentResult.error!);

    const approvalResult = ValidationValidator.validateElectronicApproval({
      decisionId: '', stage: stage.type, reviewer,
      reviewerRole: stage.type, decision,
      comments, electronicApprovalFlag: electronicApproval,
      timestamp: '',
    });
    if (!approvalResult.isValid) errors.push(approvalResult.error!);

    return errors;
  };

  const handleSubmit = () => {
    const errors = validate();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    onSubmit({ decision, comments, findings, electronicApprovalFlag: electronicApproval, reviewer });
  };

  const decisionColors: Record<ValidationDecisionType, string> = {
    'Approved': 'var(--color-status-success)',
    'Rejected': 'var(--color-status-danger)',
    'Returned For Correction': 'orange',
    'Pending': 'var(--color-text-secondary)',
  };

  return (
    <div style={styles.overlay}>
      <Card style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0, font: 'var(--type-heading-subsection)' }}>
            Review — {stage.type}
          </h3>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close review dialog">✕</button>
        </div>

        <div style={styles.body}>
          {/* Reviewer selection */}
          <div>
            <label className="lims-form-label" style={styles.label}>Reviewer</label>
            <select
              value={reviewer}
              onChange={(e) => setReviewer(e.target.value)}
              className="lims-input"
              style={{ width: '100%', height: '36px' }}
            >
              {REVIEWERS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Decision */}
          <div>
            <label className="lims-form-label" style={styles.label}>Review Decision</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['Approved', 'Rejected', 'Returned For Correction'] as ValidationDecisionType[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDecision(d)}
                  style={{
                    ...styles.decisionBtn,
                    borderColor: decision === d ? decisionColors[d] : 'var(--color-border-default)',
                    backgroundColor: decision === d ? `${decisionColors[d]}15` : 'transparent',
                    color: decision === d ? decisionColors[d] : 'var(--color-text-secondary)',
                    fontWeight: decision === d ? 700 : 400,
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Findings */}
          <div>
            <label className="lims-form-label" style={styles.label}>Clinical Findings <span style={{ color: 'gray', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              className="lims-input"
              placeholder="Document any clinical observations or laboratory findings..."
              style={{ width: '100%', height: '72px', resize: 'vertical', boxSizing: 'border-box', padding: '8px' }}
            />
          </div>

          {/* Comments */}
          <div>
            <label className="lims-form-label" style={styles.label}>
              Comments
              {decision !== 'Approved' && <span style={{ color: 'var(--color-status-danger)', marginLeft: '4px' }}>* Required (min 10 chars)</span>}
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="lims-input"
              placeholder={decision !== 'Approved' ? 'Required: Provide justification for this decision...' : 'Optional: Additional comments...'}
              style={{ width: '100%', height: '80px', resize: 'vertical', boxSizing: 'border-box', padding: '8px' }}
            />
          </div>

          {/* Electronic Approval */}
          {decision === 'Approved' && (
            <div style={styles.approvalCheckbox}>
              <input
                type="checkbox"
                id="electronicApproval"
                checked={electronicApproval}
                onChange={(e) => setElectronicApproval(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="electronicApproval" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                ✍️ I confirm my <strong>electronic approval</strong> of this validation stage.
                This constitutes my digital signature for this laboratory decision.
              </label>
            </div>
          )}

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div style={styles.errorBox}>
              {validationErrors.map((e, i) => (
                <p key={i} style={{ margin: '2px 0', fontSize: '0.82rem' }}>⚠ {e}</p>
              ))}
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button
            variant="solid"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              backgroundColor: decisionColors[decision],
              color: 'white',
              border: 'none',
            }}
          >
            {isSubmitting ? 'Submitting...' : `Confirm: ${decision}`}
          </Button>
        </div>
      </Card>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1200,
  },
  modal: {
    width: '560px', maxWidth: 'calc(100vw - 32px)',
    padding: 'var(--spacing-lg)',
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)',
    boxShadow: 'var(--elevation-3)',
    maxHeight: '90vh', overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: 'var(--spacing-sm)',
  },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--color-text-secondary)', fontSize: '1.1rem', padding: '4px 8px',
  },
  body: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' },
  label: { display: 'block', marginBottom: '6px' },
  decisionBtn: {
    padding: '6px 16px', borderRadius: '6px', border: '2px solid',
    cursor: 'pointer', fontSize: '0.82rem', transition: 'all 0.15s',
  },
  approvalCheckbox: {
    display: 'flex', gap: '10px', alignItems: 'flex-start',
    padding: '10px 14px', borderRadius: '6px',
    backgroundColor: 'rgba(34,197,94,0.06)',
    border: '1px solid rgba(34,197,94,0.25)',
  },
  errorBox: {
    padding: '10px 14px', borderRadius: '6px',
    backgroundColor: 'var(--color-status-danger-bg)',
    border: '1px solid var(--color-status-danger)',
    color: 'var(--color-status-danger)',
  },
  footer: {
    display: 'flex', justifyContent: 'flex-end', gap: '8px',
    borderTop: '1px solid var(--color-border-default)',
    paddingTop: 'var(--spacing-md)',
  },
};

export default ValidationReviewDialog;
