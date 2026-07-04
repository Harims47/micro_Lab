import React from 'react';
import type { AstMetric } from '../models/types';
import { Card } from '../../../components/Layout/Card';

interface AstProps {
  ast: AstMetric[];
}

export const AstAnalytics: React.FC<AstProps> = ({ ast }) => {
  return (
    <Card style={{ padding: 'var(--spacing-md)' }}>
      <h4 style={{ margin: '0 0 12px 0', font: 'var(--type-heading-item)' }}>Antimicrobial Resistance & Sensitivity Rates</h4>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {ast.map((item) => (
          <div key={item.agentName} style={styles.row}>
            <span style={{ width: '120px', fontSize: '0.8rem', fontWeight: 600 }}>{item.agentName}</span>
            <div style={styles.bar}>
              <div style={{ width: `${item.sensitiveRate}%`, backgroundColor: 'var(--color-status-success)', height: '100%' }} title={`Sensitive: ${item.sensitiveRate}%`} />
              <div style={{ width: `${item.intermediateRate}%`, backgroundColor: 'orange', height: '100%' }} title={`Intermediate: ${item.intermediateRate}%`} />
              <div style={{ width: `${item.resistantRate}%`, backgroundColor: 'var(--color-status-danger)', height: '100%' }} title={`Resistant: ${item.resistantRate}%`} />
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', width: '120px', justifyContent: 'flex-end' }}>
              <span style={{ color: 'var(--color-status-success)' }}>S:{item.sensitiveRate}%</span>
              <span style={{ color: 'var(--color-status-danger)' }}>R:{item.resistantRate}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  row: { display: 'flex', alignItems: 'center', gap: '12px' },
  bar: { flex: 1, height: '18px', borderRadius: '4px', overflow: 'hidden', display: 'flex' },
};

export default AstAnalytics;
