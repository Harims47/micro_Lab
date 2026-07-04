import React, { useState } from 'react';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { TextInput } from '../../../components/Form/TextInput';

interface IdentificationReviewDialogProps {
  onClose: () => void;
  onSubmit: (decision: { status: 'Approved' | 'Rejected'; reason?: string; reviewer: string }) => void;
}

export const IdentificationReviewDialog: React.FC<IdentificationReviewDialogProps> = ({
  onClose,
  onSubmit,
}) => {
  const [status, setStatus] = useState<'Approved' | 'Rejected'>('Approved');
  const [reason, setReason] = useState('');

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      status,
      reason: reason.trim() ? reason : undefined,
      reviewer: 'supervisor_user',
    });
  };

  return (
    <div style={styles.overlay}>
      <Card style={styles.modal}>
        <h3 style={styles.title}>Supervisor QC Clinical Review Checkpoint</h3>

        <form onSubmit={handleReviewSubmit} style={styles.form}>
          <div>
            <label className="lims-form-label" style={{ display: 'block', marginBottom: '6px' }}>QC Determination</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="lims-input"
              style={{ width: '100%', height: '36px' }}
            >
              <option value="Approved">Verify & Approve Taxon ID</option>
              <option value="Rejected">Reject & Request Repeat Identification</option>
            </select>
          </div>

          <div>
            <TextInput
              label="Audit Justification"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Verified with MALDI-TOF spectral peak match."
              required={status === 'Rejected'} // Reason required for rejections
            />
          </div>

          <div style={styles.actions}>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="solid"
              type="submit"
              style={{ backgroundColor: status === 'Approved' ? 'var(--color-status-success)' : 'var(--color-status-danger)', color: 'white' }}
            >
              Confirm QC Review
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
  },
  modal: {
    width: '400px',
    padding: 'var(--spacing-lg)',
    boxShadow: 'var(--elevation-3)',
  },
  title: {
    font: 'var(--type-heading-subsection)',
    margin: '0 0 var(--spacing-md) 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    borderTop: '1px solid var(--color-border-default)',
    paddingTop: 'var(--spacing-md)',
    marginTop: '12px',
  },
};
export default IdentificationReviewDialog;
