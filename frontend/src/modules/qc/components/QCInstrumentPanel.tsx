import React, { useState } from 'react';
import type { QCInstrument } from '../models/types';
import { QcService } from '../services/qcService';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { useNotification } from '../../../infrastructure/notifications/useNotification';

interface QCInstrumentProps {
  instruments: QCInstrument[];
  onRefresh: () => void;
}

export const QCInstrumentPanel: React.FC<QCInstrumentProps> = ({ instruments, onRefresh }) => {
  const notify = useNotification();
  const [maintenanceDates, setMaintenanceDates] = useState<Record<string, string>>({});

  const handleCalibrate = async (id: string) => {
    try {
      await QcService.calibrateInstrument(id);
      notify.addToast('success', 'Instrument calibration status updated.');
      onRefresh();
    } catch {
      notify.addToast('error', 'Calibration update failed.');
    }
  };

  const handleScheduleMaintenance = async (id: string) => {
    const date = maintenanceDates[id];
    if (!date) {
      notify.addToast('error', 'Select a maintenance date first.');
      return;
    }
    try {
      await QcService.scheduleMaintenance(id, date);
      notify.addToast('success', 'Instrument maintenance scheduled.');
      onRefresh();
    } catch {
      notify.addToast('error', 'Failed to schedule maintenance.');
    }
  };

  const handleCompleteMaintenance = async (id: string) => {
    try {
      await QcService.completeMaintenance(id);
      notify.addToast('success', 'Maintenance completed. Status updated.');
      onRefresh();
    } catch {
      notify.addToast('error', 'Failed to complete maintenance.');
    }
  };

  return (
    <Card style={{ padding: 'var(--spacing-md)' }}>
      <h4 style={{ margin: '0 0 12px 0', font: 'var(--type-heading-item)' }}>Instrument Calibration & Maintenance</h4>
      <div style={styles.grid}>
        {instruments.map((inst) => (
          <div key={inst.instrumentId} style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <strong style={{ fontSize: '0.9rem' }}>{inst.name}</strong>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>{inst.code}</div>
              </div>
              <span style={{
                padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700,
                backgroundColor: inst.status === 'Calibrated' || inst.status === 'Maintenance Completed' ? 'rgba(34,197,94,0.06)'
                  : inst.status === 'Offline' ? 'rgba(239,68,68,0.06)'
                  : 'rgba(245,158,11,0.06)',
                color: inst.status === 'Calibrated' || inst.status === 'Maintenance Completed' ? 'var(--color-status-success)'
                  : inst.status === 'Offline' ? 'var(--color-status-danger)'
                  : 'orange',
              }}>
                {inst.status}
              </span>
            </div>

            <div style={styles.details}>
              <div><span style={styles.label}>Last Calibration:</span> <span>{inst.lastCalibrationDate ? new Date(inst.lastCalibrationDate).toLocaleDateString() : '—'}</span></div>
              <div><span style={styles.label}>Next Calibration:</span> <span>{inst.nextCalibrationDueDate ? new Date(inst.nextCalibrationDueDate).toLocaleDateString() : '—'}</span></div>
              <div><span style={styles.label}>Last Maintenance:</span> <span>{inst.lastMaintenanceDate ? new Date(inst.lastMaintenanceDate).toLocaleDateString() : '—'}</span></div>
              <div><span style={styles.label}>Downtime Hours:</span> <span>{inst.downtimeHours} hrs</span></div>
            </div>

            <div style={styles.actions}>
              <Button
                variant="solid"
                onClick={() => handleCalibrate(inst.instrumentId)}
                style={{ flex: 1, fontSize: '0.72rem', height: '28px', padding: 0 }}
              >
                Calibrate
              </Button>
              {inst.status === 'Maintenance Scheduled' ? (
                <Button
                  variant="outline"
                  onClick={() => handleCompleteMaintenance(inst.instrumentId)}
                  style={{ flex: 1, fontSize: '0.72rem', height: '28px', padding: 0 }}
                >
                  Complete Maint
                </Button>
              ) : (
                <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                  <input
                    type="date"
                    value={maintenanceDates[inst.instrumentId] ?? ''}
                    onChange={(e) => setMaintenanceDates({ ...maintenanceDates, [inst.instrumentId]: e.target.value })}
                    className="lims-input"
                    style={{ width: '90px', height: '28px', fontSize: '0.72rem', padding: '0 4px' }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleScheduleMaintenance(inst.instrumentId)}
                    style={{ fontSize: '0.72rem', height: '28px', padding: '0 8px' }}
                  >
                    Maint
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' },
  card: {
    padding: '12px 14px', borderRadius: '6px', border: '1px solid var(--color-border-default)',
    backgroundColor: 'var(--color-surface-raised)',
    display: 'flex', flexDirection: 'column', gap: '10px',
  },
  details: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem', borderTop: '1px solid var(--color-border-default)', paddingTop: '8px' },
  label: { color: 'var(--color-text-secondary)', fontWeight: 600 },
  actions: { display: 'flex', gap: '6px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed var(--color-border-default)' },
};

export default QCInstrumentPanel;
