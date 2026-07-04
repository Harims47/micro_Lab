import React from 'react';
import type { Department } from '../models/types';
import { Card } from '../../../components/Layout/Card';

interface DeptMgmtProps {
  departments: Department[];
}

export const DepartmentManagement: React.FC<DeptMgmtProps> = ({ departments }) => {
  return (
    <Card style={{ padding: 'var(--spacing-md)' }}>
      <h4 style={{ margin: '0 0 12px 0', font: 'var(--type-heading-item)' }}>Laboratory Departments</h4>
      <div style={styles.grid}>
        {departments.map((d) => (
          <div key={d.deptId} style={styles.card}>
            <div style={styles.badge}>{d.code}</div>
            <strong style={{ fontSize: '0.92rem', display: 'block', marginTop: '6px' }}>{d.name}</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block', marginTop: '4px' }}>
              Head of Department:
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{d.head}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' },
  card: {
    padding: '12px 14px', borderRadius: '6px', border: '1px solid var(--color-border-default)',
    backgroundColor: 'var(--color-surface-raised)',
  },
  badge: {
    display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
    backgroundColor: 'rgba(99,102,241,0.06)', color: '#6366f1',
    fontSize: '0.7rem', fontWeight: 700, border: '1px solid rgba(99,102,241,0.2)',
  },
};

export default DepartmentManagement;
