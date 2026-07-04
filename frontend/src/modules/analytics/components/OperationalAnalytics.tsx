import React from 'react';
import type { TrendSeries } from '../models/types';
import { Card } from '../../../components/Layout/Card';

interface OperationalProps {
  daily: TrendSeries[];
  monthly: TrendSeries[];
}

export const OperationalAnalytics: React.FC<OperationalProps> = ({ daily, monthly }) => {
  return (
    <div style={styles.grid}>
      {/* Daily tests bar list */}
      <Card style={{ padding: 'var(--spacing-md)' }}>
        <h4 style={{ margin: '0 0 12px 0', font: 'var(--type-heading-item)' }}>Daily Productivity (Current Week)</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {daily.map((item) => (
            <div key={item.date}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                <span>{item.date}</span>
                <strong>{item.count} tests</strong>
              </div>
              <div style={{ height: '5px', borderRadius: '2px', backgroundColor: 'var(--color-border-default)', overflow: 'hidden' }}>
                <div style={{ width: `${(item.count / 25) * 100}%`, height: '100%', backgroundColor: '#0891b2' }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Monthly totals */}
      <Card style={{ padding: 'var(--spacing-md)' }}>
        <h4 style={{ margin: '0 0 12px 0', font: 'var(--type-heading-item)' }}>Monthly Laboratory Output</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {monthly.map((item) => (
            <div key={item.date}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                <span>{item.date}</span>
                <strong>{item.count} runs</strong>
              </div>
              <div style={{ height: '5px', borderRadius: '2px', backgroundColor: 'var(--color-border-default)', overflow: 'hidden' }}>
                <div style={{ width: `${(item.count / 500) * 100}%`, height: '100%', backgroundColor: '#6366f1' }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const styles = {
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' },
};

export default OperationalAnalytics;
