import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Overlay/Modal';
import { Button } from '../../../components/Foundation/Button';
import { Select } from '../../../components/Form/Select';
import { TextArea } from '../../../components/Form/TextArea';
import { PatientService } from '../services/patientService';
import { useNotification } from '../../../infrastructure/notifications/useNotification';
import { useGlobalState } from '../../../providers/GlobalStateProvider';
import type { Patient } from '../models/types';

interface PatientMergeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PatientMergeDialog: React.FC<PatientMergeDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addToast } = useNotification();
  const { addAuditLog } = useGlobalState();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [primaryId, setPrimaryId] = useState('');
  const [duplicateId, setDuplicateId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load patients on mount / open
  useEffect(() => {
    if (isOpen) {
      const fetchActivePatients = async () => {
        try {
          const res = await PatientService.getPatients({ limit: 100, status: 'Active' });
          setPatients(res.patients);
        } catch {
          addToast('error', 'Failed to retrieve active patients list.');
        }
      };
      fetchActivePatients();
      // Reset form fields
      setPrimaryId('');
      setDuplicateId('');
      setReason('');
      setError(null);
    }
  }, [isOpen, addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!primaryId || !duplicateId) {
      setError('Both Primary Patient and Duplicate Patient fields are required.');
      return;
    }

    if (primaryId === duplicateId) {
      setError('Cannot merge a patient record into itself.');
      return;
    }

    if (!reason.trim() || reason.trim().length < 8) {
      setError('Please provide a detailed merge justification (minimum 8 characters).');
      return;
    }

    setLoading(true);
    try {
      await PatientService.mergePatients(primaryId, duplicateId, reason);
      addToast('success', 'Duplicate patient records consolidated successfully.', 'Records Merged');
      
      const primary = patients.find((p) => p.patientId === primaryId);
      const duplicate = patients.find((p) => p.patientId === duplicateId);
      if (primary && duplicate) {
        addAuditLog(
          'Patient Merge',
          'Patient',
          primaryId,
          `Merged duplicate record ${duplicate.mrn} into primary record ${primary.mrn}. Justification: ${reason}`
        );
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Records consolidation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Map patient options for Select dropdowns
  const patientOptions = patients.map((p) => ({
    value: p.patientId,
    label: `${p.lastName}, ${p.firstName} (${p.mrn})`,
  }));

  const footerActions = (
    <>
      <Button variant="outline" onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button variant="solid" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Consolidating...' : 'Merge Records'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Consolidate Duplicate Patient Records"
      footerActions={footerActions}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              backgroundColor: 'var(--color-status-danger-bg)',
              border: '1px solid var(--color-status-danger)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--spacing-sm)',
            }}
          >
            <span>⚠️</span>
            <span style={{ font: 'var(--type-body-small)', color: 'var(--color-status-danger)', fontWeight: 500 }}>
              {error}
            </span>
          </div>
        )}

        <p style={{ font: 'var(--type-body-small)', color: 'var(--color-text-secondary)', margin: 0 }}>
          This operation merges duplicate clinical indexes. All related culture timelines and logs will refer to the Primary record. The Duplicate record will be marked Inactive.
        </p>

        <Select
          label="Primary Surviving Patient Record"
          value={primaryId}
          onChange={(e) => setPrimaryId(e.target.value)}
          options={[{ value: '', label: '-- Select Primary Patient --' }, ...patientOptions]}
          required
        />

        <Select
          label="Duplicate Patient Record to Merge"
          value={duplicateId}
          onChange={(e) => setDuplicateId(e.target.value)}
          options={[
            { value: '', label: '-- Select Duplicate Patient --' },
            ...patientOptions.filter((o) => o.value !== primaryId),
          ]}
          required
        />

        <TextArea
          label="Merge Clinical Justification"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Duplicate records created during batch ER admissions. Verified MRNs match same national ID."
          required
        />
      </form>
    </Modal>
  );
};
export default PatientMergeDialog;
