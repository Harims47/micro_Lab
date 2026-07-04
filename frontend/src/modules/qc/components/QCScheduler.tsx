import React, { useState } from 'react';
import type { QCSample } from '../models/types';
import { QcService } from '../services/qcService';
import { QcValidator } from '../validators/qcValidator';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { useNotification } from '../../../infrastructure/notifications/useNotification';

interface QCSchedulerProps {
  onRefresh: () => void;
}

export const QCScheduler: React.FC<QCSchedulerProps> = ({ onRefresh }) => {
  const { addToast } = useNotification();
  const [strain, setStrain] = useState('ATCC 25922');
  const [organism, setOrganism] = useState('Escherichia coli');
  const [scheduledDate, setScheduledDate] = useState('');
  const [lotNumber, setLotNumber] = useState('LOT-RE-100');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const STRAIN_OPTIONS = [
    { value: 'ATCC 25922', label: 'E. coli (ATCC 25922)' },
    { value: 'ATCC 25923', label: 'S. aureus (ATCC 25923)' },
    { value: 'ATCC 27853', label: 'P. aeruginosa (ATCC 27853)' },
    { value: 'ATCC 29213', label: 'E. faecalis (ATCC 29213)' },
  ];

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const req: Partial<QCSample> = {
      controlStrain: strain,
      targetOrganism: organism,
      scheduledDate,
      lotNumber,
    };

    const check = QcValidator.validateSampleSchedule(req);
    if (!check.isValid) {
      addToast('error', check.error!);
      return;
    }

    setIsSubmitting(true);
    try {
      await QcService.scheduleSample(req);
      addToast('success', 'QC Run scheduled successfully.');
      setScheduledDate('');
      onRefresh();
    } catch {
      addToast('error', 'Failed to schedule QC run.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card style={{ padding: 'var(--spacing-md)' }}>
      <h4 style={{ margin: '0 0 12px 0', font: 'var(--type-heading-item)' }}>Schedule Quality Control Run</h4>
      <form onSubmit={handleSchedule} style={styles.form}>
        <div style={{ flex: 1, minWidth: '180px' }}>
          <label className="lims-form-label" style={styles.label}>Control Strain</label>
          <select
            value={strain}
            onChange={(e) => {
              setStrain(e.target.value);
              // Auto map target organism
              const matched = STRAIN_OPTIONS.find((o) => o.value === e.target.value);
              if (matched) {
                setOrganism(matched.label.split(' ')[0] === 'E.' ? 'Escherichia coli' : 'Staphylococcus aureus');
              }
            }}
            className="lims-input"
            style={{ width: '100%', height: '36px' }}
          >
            {STRAIN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label className="lims-form-label" style={styles.label}>Reagent Lot Number</label>
          <input
            type="text"
            value={lotNumber}
            onChange={(e) => setLotNumber(e.target.value)}
            className="lims-input"
            style={{ width: '100%', height: '36px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label className="lims-form-label" style={styles.label}>Scheduled Date</label>
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="lims-input"
            style={{ width: '100%', height: '36px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', height: '58px' }}>
          <Button variant="solid" type="submit" disabled={isSubmitting} style={{ height: '36px' }}>
            Schedule Run
          </Button>
        </div>
      </form>
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  form: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' },
  label: { display: 'block', marginBottom: '6px' },
};

export default QCScheduler;
