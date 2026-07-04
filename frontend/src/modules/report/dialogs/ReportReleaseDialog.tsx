import React, { useState } from 'react';
import type { LaboratoryReport } from '../models/types';
import { ReportValidator } from '../validators/reportValidator';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { useNotification } from '../../../infrastructure/notifications/useNotification';

interface ReleaseDialogProps {
  report: LaboratoryReport;
  onConfirmRelease: (releaseNotes: string, distributionMethods: string[]) => void;
  onConfirmAmendment: (amendmentReason: string) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

export const ReportReleaseDialog: React.FC<ReleaseDialogProps> = ({
  report,
  onConfirmRelease,
  onConfirmAmendment,
  onClose,
  isSubmitting = false,
}) => {
  const { addToast } = useNotification();
  const [releaseNotes, setReleaseNotes] = useState('');
  const [channels, setChannels] = useState<string[]>(['Print', 'PDF Export']);
  const [amendReason, setAmendReason] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const isReleased = report.status === 'Released';

  const DISTRIBUTION_OPTIONS = [
    { value: 'Print',          label: 'Print Hardcopy' },
    { value: 'PDF Export',     label: 'Export to PDF File' },
    { value: 'Email',          label: 'Email to Clinical Provider' },
    { value: 'SMS',            label: 'SMS Patient Notification' },
    { value: 'Patient Portal', label: 'Upload to Patient Portal' },
    { value: 'HIS',            label: 'Route to HIS Queue' },
    { value: 'LIS',            label: 'Route to LIS Queue' },
  ];

  const handleToggleChannel = (ch: string) => {
    setChannels(
      channels.includes(ch) ? channels.filter((c) => c !== ch) : [...channels, ch]
    );
  };

  const handleRelease = () => {
    const check = ReportValidator.validateRelease(report);
    if (!check.isValid) {
      setValidationErrors([check.error!]);
      addToast('error', check.error!);
      return;
    }
    setValidationErrors([]);
    onConfirmRelease(releaseNotes, channels);
  };

  const handleAmendSubmit = () => {
    const check = ReportValidator.validateAmendment(amendReason);
    if (!check.isValid) {
      setValidationErrors([check.error!]);
      addToast('error', check.error!);
      return;
    }
    setValidationErrors([]);
    onConfirmAmendment(amendReason);
  };

  return (
    <div style={styles.overlay}>
      <Card style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0, font: 'var(--type-heading-subsection)' }}>
            {isReleased ? '⚠️ Initiate Report Amendment' : '🚀 Release Laboratory Report'}
          </h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.body}>
          {/* Validation errors box */}
          {validationErrors.length > 0 && (
            <div style={styles.errorBox}>
              {validationErrors.map((e, i) => <div key={i}>⚠ {e}</div>)}
            </div>
          )}

          {/* Mode 1: Release controls */}
          {!isReleased ? (
            <>
              <div>
                <label className="lims-form-label" style={styles.label}>Final Release Comments / Notes</label>
                <textarea
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  placeholder="e.g. AST zone measurements correlate with guideline panels..."
                  style={{ width: '100%', height: '70px', resize: 'vertical', boxSizing: 'border-box', padding: '8px' }}
                />
              </div>

              <div>
                <label className="lims-form-label" style={styles.label}>Controlled Distribution Channels</label>
                <div style={styles.channelsGrid}>
                  {DISTRIBUTION_OPTIONS.map((opt) => (
                    <label key={opt.value} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={channels.includes(opt.value)}
                        onChange={() => handleToggleChannel(opt.value)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.alertBox}>
                ✍️ Releasing this report will lock all clinical values and send results to the selected queues.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button variant="solid" onClick={handleRelease} disabled={isSubmitting} style={{ backgroundColor: 'var(--color-status-success)', color: 'white', border: 'none' }}>
                  {isSubmitting ? 'Releasing...' : 'Confirm Release'}
                </Button>
              </div>
            </>
          ) : (
            /* Mode 2: Amendment controls */
            <>
              <div style={styles.amendWarning}>
                ❗ Amendments generate a new semantic version (e.g. {report.version} → v1.1 Amendment) and reset report signatures to require fresh validation signing.
              </div>

              <div>
                <label className="lims-form-label" style={styles.label}>Justification Reason <span style={{ color: 'red' }}>*</span></label>
                <textarea
                  value={amendReason}
                  onChange={(e) => setAmendReason(e.target.value)}
                  placeholder="Type justification reason (minimum 5 characters)..."
                  style={{ width: '100%', height: '80px', resize: 'vertical', boxSizing: 'border-box', padding: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button variant="solid" onClick={handleAmendSubmit} disabled={isSubmitting} style={{ backgroundColor: '#7c3aed', color: 'white', border: 'none' }}>
                  {isSubmitting ? 'Amending...' : 'Apply Amendment Version'}
                </Button>
              </div>
            </>
          )}
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
    width: '560px', maxWidth: 'calc(100vw - 32px)', padding: 'var(--spacing-lg)',
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)',
  },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-sm)' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '1rem' },
  body: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' },
  label: { display: 'block', marginBottom: '6px', fontWeight: 600 },
  channelsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '4px 0' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' },
  alertBox: {
    padding: '10px 12px', borderRadius: '6px', fontSize: '0.8rem',
    backgroundColor: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)', color: 'var(--color-status-success)',
  },
  amendWarning: {
    padding: '10px 12px', borderRadius: '6px', fontSize: '0.8rem',
    backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--color-status-danger)',
  },
  errorBox: {
    padding: '10px 12px', borderRadius: '6px', fontSize: '0.8rem',
    backgroundColor: 'var(--color-status-danger-bg)', border: '1px solid var(--color-status-danger)', color: 'var(--color-status-danger)',
  },
};

export default ReportReleaseDialog;
