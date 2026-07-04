import React from 'react';
import type { OrganismMetric } from '../models/types';
import { Card } from '../../../components/Layout/Card';

interface OrganismProps {
  organisms: OrganismMetric[];
  positiveRate: number;
  negativeRate: number;
}

export const OrganismAnalytics: React.FC<OrganismProps> = ({ organisms, positiveRate, negativeRate }) => {
  return (
    <div style={styles.grid}>
      {/* Top organism metrics bar chart */}
      <Card style={{ padding: 'var(--spacing-md)' }}>
        <h4 style={{ margin: '0 0 12px 0', font: 'var(--type-heading-item)' }}>Top Isolated Organisms</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {organisms.map((o) => (
            <div key={o.organismName}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                <span style={{ fontStyle: 'italic' }}>{o.organismName}</span>
                <strong>{o.count} isolates ({o.percentage}%)</strong>
              </div>
              <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'var(--color-border-default)', overflow: 'hidden' }}>
                <div style={{ width: `${o.percentage}%`, height: '100%', backgroundColor: '#6366f1' }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Positive culture rates */}
      <Card style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', justifyItems: 'center' }}>
        <h4 style={{ margin: '0 0 12px 0', font: 'var(--type-heading-item)' }}>Culture Positivity Distribution</h4>
        
        <div style={{ marginTop: 'auto', marginBottom: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
              <span>Positive Cultures</span>
              <strong>{positiveRate}%</strong>
            </div>
            <div style={{ height: '16px', borderRadius: '8px', backgroundColor: 'var(--color-border-default)', overflow: 'hidden' }}>
              <div style={{ width: `${positiveRate}%`, height: '100%', backgroundColor: 'var(--color-status-success)' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
              <span>Negative Cultures / Contaminants</span>
              <strong>{negativeRate}%</strong>
            </div>
            <div style={{ height: '16px', borderRadius: '8px', backgroundColor: 'var(--color-border-default)', overflow: 'hidden' }}>
              <div style={{ width: `${negativeRate}%`, height: '100%', backgroundColor: 'var(--color-text-secondary)' }} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const styles = {
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' },
};

export default OrganismAnalytics;
