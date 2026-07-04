import React, { useState } from 'react';
import type { ReportSignature } from '../models/types';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';

interface SignatureDialogProps {
  currentSignatures: ReportSignature[];
  onSubmit: (signature: Pick<ReportSignature, 'signer' | 'role'>) => void;
  onRemove: (signatureId: string) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

export const ReportSignatureDialog: React.FC<SignatureDialogProps> = ({
  currentSignatures,
  onSubmit,
  onRemove,
  onClose,
  isSubmitting = false,
}) => {
  const [signer, setSigner] = useState('tech_user');
  const [role, setRole] = useState('Laboratory Technologist');

  const ROLE_OPTIONS = [
    { value: 'Laboratory Technologist', label: 'Laboratory Technologist' },
    { value: 'Technical Reviewer',      label: 'Technical Reviewer (Peer)' },
    { value: 'Clinical Microbiologist', label: 'Clinical Microbiologist' },
    { value: 'Pathologist',             label: 'Pathologist (MD)' },
    { value: 'Final Laboratory Authorization', label: 'Final Laboratory Authorization' },
  ];

  const SIGNERS = [
    { value: 'tech_user',        label: 'David Miller (Technologist)' },
    { value: 'supervisor_user',  label: 'Dr. Jane Smith (Supervisor)' },
    { value: 'dr_chen',          label: 'Dr. Arthur Chen (Microbiologist)' },
    { value: 'dr_patel',         label: 'Dr. Rajesh Patel (Pathologist)' },
  ];

  const handleSign = () => {
    onSubmit({ signer, role });
  };

  return (
    <div style={styles.overlay}>
      <Card style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0, font: 'var(--type-heading-subsection)' }}>
            ✍️ Report Electronic Signature
          </h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.body}>
          {/* Add signature panel */}
          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label className="lims-form-label" style={styles.label}>Select Signer Name</label>
              <select
                value={signer}
                onChange={(e) => setSigner(e.target.value)}
                className="lims-input"
                style={{ width: '100%', height: '36px' }}
              >
                {SIGNERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="lims-form-label" style={styles.label}>Select Reviewer Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="lims-input"
                style={{ width: '100%', height: '36px' }}
              >
                {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
            <Button variant="solid" onClick={handleSign} disabled={isSubmitting}>
              Apply E-Signature
            </Button>
          </div>

          {/* Current signatures list with remove button */}
          <div style={{ borderTop: '1px solid var(--color-border-default)', paddingTop: '12px', marginTop: '6px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem' }}>Active Signatures Attached</h4>
            {currentSignatures.length === 0 ? (
              <p style={{ fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                No signatures applied to report draft yet.
              </p>
            ) : (
              <div style={styles.sigList}>
                {currentSignatures.map((sig) => (
                  <div key={sig.id} style={styles.sigCard}>
                    <div>
                      <strong>{sig.signer}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>{sig.role}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                        {new Date(sig.timestamp).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => onRemove(sig.id)}
                        disabled={isSubmitting}
                        style={styles.removeBtn}
                        title="Remove signature"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={styles.footer}>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </Card>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200,
  },
  modal: {
    width: '520px', maxWidth: 'calc(100vw - 32px)', padding: 'var(--spacing-lg)',
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)',
  },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-sm)' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '1rem' },
  body: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' },
  row: { display: 'flex', gap: '12px' },
  label: { display: 'block', marginBottom: '6px' },
  sigList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  sigCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border-default)',
    backgroundColor: 'var(--color-surface-base)',
  },
  removeBtn: {
    border: 'none', background: 'none', color: 'var(--color-status-danger)',
    fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600,
  },
  footer: { display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border-default)', paddingTop: 'var(--spacing-md)' },
};

export default ReportSignatureDialog;
