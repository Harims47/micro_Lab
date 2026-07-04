import React from 'react';
import { Card } from '../../../components/Layout/Card';

interface KPIWidgetsProps {
  tat: number;
}

export const KPIWidgets: React.FC<KPIWidgetsProps> = ({ tat }) => {
  const stages = [
    { name: 'Order Intake',   time: '1.2 hrs',  pct: 6 },
    { name: 'Specimen Prep',  time: '2.5 hrs',  pct: 14 },
    { name: 'Culture Incub',  time: '18.0 hrs', pct: 40 },
    { name: 'Organism Ident', time: '3.4 hrs',  pct: 18 },
    { name: 'AST Testing',    time: '4.2 hrs',  pct: 22 },
    { name: 'Tech Validation',time: '1.5 hrs',  pct: 8 },
    { name: 'Final Report',   time: '0.8 hrs',  pct: 4 },
  ];

  return (
    <Card style={{ padding: 'var(--spacing-md)' }}>
      <h4 style={{ margin: '0 0 12px 0', font: 'var(--type-heading-item)' }}>Turnaround Time (TAT) Stage Analysis</h4>
      <h5 style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
        Average Total Turnaround Time: <strong style={{ color: 'var(--color-brand-primary)' }}>{tat} hrs</strong>
      </h5>
      
      <div style={styles.timeline}>
        {stages.map((st, i) => (
          <div key={st.name} style={styles.stage}>
            <div style={styles.stageHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={styles.badge}>{i + 1}</span>
                <strong style={{ fontSize: '0.85rem' }}>{st.name}</strong>
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-brand-primary)' }}>{st.time}</span>
            </div>
            
            <div style={styles.barContainer}>
              <div style={{ ...styles.bar, width: `${st.pct * 2.5}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  timeline: { display: 'flex', flexDirection: 'column', gap: '10px' },
  stage: { display: 'flex', flexDirection: 'column', gap: '4px' },
  stageHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  badge: {
    width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '50%', backgroundColor: 'rgba(99,102,241,0.06)', color: '#6366f1',
    fontSize: '0.72rem', fontWeight: 700, border: '1px solid rgba(99,102,241,0.2)',
  },
  barContainer: { height: '6px', borderRadius: '3px', backgroundColor: 'var(--color-border-default)', overflow: 'hidden' },
  bar: { height: '100%', backgroundColor: 'var(--color-brand-primary)' },
};

export default KPIWidgets;
