import React from 'react';
import { Card } from '../../../components/Layout/Card';

export const CompliancePanel: React.FC = () => {
  const checklist = [
    { rule: 'Immutability of Audit Trails', status: 'Compliant', details: 'Enforced by database-level locks (write/update validations).' },
    { rule: 'Technician / Reviewer Segregation', status: 'Compliant', details: 'Technicians block checking their own AST validations.' },
    { rule: 'Electronic Approvals Tracking', status: 'Compliant', details: 'Required before pathologist releases results.' },
    { rule: 'Lot Number Integrity Mapping', status: 'Compliant', details: 'Reagent logs checked during QC specimen registration.' },
  ];

  return (
    <Card style={{ padding: 'var(--spacing-md)' }}>
      <h4 style={{ margin: '0 0 12px 0', font: 'var(--type-heading-item)' }}>Regulatory & Compliance Checklists</h4>
      <div style={styles.list}>
        {checklist.map((item, i) => (
          <div key={i} style={styles.item}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{item.rule}</strong>
              <span style={styles.badge}>{item.status}</span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
              {item.details}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  item: {
    padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--color-border-default)',
    backgroundColor: 'var(--color-surface-raised)',
  },
  badge: {
    fontSize: '0.7rem', fontWeight: 700,
    padding: '2px 8px', borderRadius: '4px',
    backgroundColor: 'rgba(34,197,94,0.06)', color: 'var(--color-status-success)',
    border: '1px solid rgba(34,197,94,0.2)',
  },
};

export default CompliancePanel;
