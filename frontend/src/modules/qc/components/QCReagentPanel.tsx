import React, { useState } from 'react';
import type { QCReagent } from '../models/types';
import { QcService } from '../services/qcService';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { useNotification } from '../../../infrastructure/notifications/useNotification';

interface QCReagentProps {
  reagents: QCReagent[];
  onRefresh: () => void;
}

export const QCReagentPanel: React.FC<QCReagentProps> = ({ reagents, onRefresh }) => {
  const { addToast } = useNotification();
  const [name, setName] = useState('');
  const [lot, setLot] = useState('');
  const [expiry, setExpiry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !lot || !expiry) {
      addToast('error', 'All fields are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await QcService.registerReagent({ name, lotNumber: lot, expirationDate: expiry });
      addToast('success', 'Reagent lot registered successfully.');
      setName('');
      setLot('');
      setExpiry('');
      onRefresh();
    } catch {
      addToast('error', 'Failed to register reagent lot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div style={styles.container}>
      {/* Registration */}
      <Card style={{ padding: 'var(--spacing-md)' }}>
        <h4 style={{ margin: '0 0 12px 0', font: 'var(--type-heading-item)' }}>Register Reagent Lot</h4>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Reagent Kit Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="lims-input"
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Lot Number (e.g. LOT-AB-1)"
            value={lot}
            onChange={(e) => setLot(e.target.value)}
            className="lims-input"
            style={styles.input}
          />
          <input
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="lims-input"
            style={styles.input}
          />
          <Button variant="solid" type="submit" disabled={isSubmitting} style={{ height: '36px' }}>
            Register Lot
          </Button>
        </form>
      </Card>

      {/* Lot grid list */}
      <Card style={{ padding: 'var(--spacing-md)' }}>
        <h4 style={{ margin: '0 0 12px 0', font: 'var(--type-heading-item)' }}>Reagent Lot Registry</h4>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Reagent Name</th>
              <th style={styles.th}>Lot Number</th>
              <th style={styles.th}>Expiration Date</th>
              <th style={styles.th}>Storage</th>
              <th style={styles.th}>Usage Runs</th>
              <th style={styles.th}>QC Lot Status</th>
            </tr>
          </thead>
          <tbody>
            {reagents.map((r) => {
              const isExpired = r.expirationDate < today;
              return (
                <tr key={r.reagentId} style={{ backgroundColor: isExpired ? 'rgba(239,68,68,0.02)' : 'transparent' }}>
                  <td style={styles.td}><strong>{r.name}</strong></td>
                  <td style={styles.td}><code style={{ fontSize: '0.78rem' }}>{r.lotNumber}</code></td>
                  <td style={styles.td}>
                    <span style={{ color: isExpired ? 'var(--color-status-danger)' : 'inherit', fontWeight: isExpired ? 600 : 400 }}>
                      {r.expirationDate} {isExpired && ' (EXPIRED)'}
                    </span>
                  </td>
                  <td style={styles.td}>{r.storageConditions}</td>
                  <td style={styles.td}>{r.usageCount} tests</td>
                  <td style={styles.td}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600,
                      backgroundColor: r.qcStatus === 'Passed' ? 'rgba(34,197,94,0.06)' : r.qcStatus === 'Failed' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)',
                      color: r.qcStatus === 'Passed' ? 'var(--color-status-success)' : r.qcStatus === 'Failed' ? 'var(--color-status-danger)' : 'orange',
                    }}>
                      {r.qcStatus}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' },
  form: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' },
  input: { height: '36px', minWidth: '150px', flex: 1, fontSize: '0.82rem' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' },
  th: {
    textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--color-border-default)',
    color: 'var(--color-text-secondary)', fontWeight: 700,
  },
  td: { padding: '6px 8px', borderBottom: '1px solid var(--color-border-default)' },
};

export default QCReagentPanel;
