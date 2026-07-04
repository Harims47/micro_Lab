import React, { useState } from 'react';
import type { DistributionRecord } from '../models/types';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';

interface DistributionProps {
  distributionHistory: DistributionRecord[];
  onTriggerDistribution: (method: DistributionRecord['method'], destination: string) => void;
  readOnly?: boolean;
}

export const DistributionPanel: React.FC<DistributionProps> = ({
  distributionHistory,
  onTriggerDistribution,
  readOnly = false,
}) => {
  const [destEmail, setDestEmail] = useState('clinical-inbox@hospital.org');
  const [destSMS, setDestSMS] = useState('+1 (555) 998-2831');
  const [destPrinter, setDestPrinter] = useState('Main Floor Pathology Printer');

  const methods: Array<{ method: DistributionRecord['method']; label: string; placeholder: string; stateValue: string; setStateValue: (v: string) => void }> = [
    { method: 'Email',          label: 'Email Dispatch',     placeholder: 'Email address...', stateValue: destEmail,   setStateValue: setDestEmail },
    { method: 'SMS',            label: 'SMS Dispatch',       placeholder: 'Phone number...',  stateValue: destSMS,     setStateValue: setDestSMS },
    { method: 'Print',          label: 'Print dispatch',     placeholder: 'Printer name...',  stateValue: destPrinter, setStateValue: setDestPrinter },
  ];

  return (
    <Card style={styles.container}>
      <h4 style={{ margin: '0 0 12px 0', font: 'var(--type-heading-item)' }}>Controlled Report Distribution</h4>

      {/* Manual distribution triggers */}
      <div style={styles.dispatchGrid}>
        {methods.map((item) => (
          <div key={item.method} style={styles.dispatchCard}>
            <strong style={{ fontSize: '0.85rem' }}>{item.label}</strong>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <input
                type="text"
                value={item.stateValue}
                onChange={(e) => item.setStateValue(e.target.value)}
                placeholder={item.placeholder}
                disabled={readOnly}
                className="lims-input"
                style={{ flex: 1, height: '32px', fontSize: '0.82rem' }}
              />
              <Button
                variant="solid"
                disabled={readOnly}
                onClick={() => onTriggerDistribution(item.method, item.stateValue)}
                style={{ padding: '0 12px', fontSize: '0.8rem', height: '32px' }}
              >
                Send
              </Button>
            </div>
          </div>
        ))}

        {/* System interface triggers */}
        <div style={styles.systemCard}>
          <strong style={{ fontSize: '0.85rem' }}>Electronic Health Records (EHR) Interop</strong>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <Button
              variant="outline"
              disabled={readOnly}
              onClick={() => onTriggerDistribution('HIS', 'Hospital EHR interface: HIS-MB-Queue')}
              style={{ flex: 1, fontSize: '0.78rem', height: '32px' }}
            >
              Route to HIS
            </Button>
            <Button
              variant="outline"
              disabled={readOnly}
              onClick={() => onTriggerDistribution('LIS', 'Central LIS repository queue')}
              style={{ flex: 1, fontSize: '0.78rem', height: '32px' }}
            >
              Route to LIS
            </Button>
          </div>
        </div>
      </div>

      {/* Distribution history log */}
      <div style={{ borderTop: '1px solid var(--color-border-default)', paddingTop: '16px', marginTop: '12px' }}>
        <h5 style={{ margin: '0 0 8px 0', font: 'var(--type-heading-subsection)', fontSize: '0.85rem' }}>Distribution Transmission History</h5>
        {distributionHistory.length === 0 ? (
          <p style={{ fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            No report distribution records logged.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr>
                {['Method', 'Destination', 'Status', 'Timestamp', 'Initiator'].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {distributionHistory.map((log) => (
                <tr key={log.id}>
                  <td style={styles.td}><strong>{log.method}</strong></td>
                  <td style={styles.td}>{log.destination}</td>
                  <td style={styles.td}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600,
                      backgroundColor: log.status === 'Success' ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                      color: log.status === 'Success' ? 'var(--color-status-success)' : 'var(--color-status-danger)',
                    }}>
                      {log.status}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td style={styles.td}>{log.initiatedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: 'var(--spacing-md)' },
  dispatchGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  dispatchCard: {
    padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border-default)',
    backgroundColor: 'var(--color-surface-raised)',
  },
  systemCard: {
    padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border-default)',
    backgroundColor: 'var(--color-surface-raised)', gridColumn: 'span 2',
  },
  th: {
    textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--color-border-default)',
    color: 'var(--color-text-secondary)', fontWeight: 700,
  },
  td: { padding: '6px 8px', borderBottom: '1px solid var(--color-border-default)' },
};

export default DistributionPanel;
