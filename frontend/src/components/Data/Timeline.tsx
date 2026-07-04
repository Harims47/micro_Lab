import React from 'react';
import './Data.css';

export interface TimelineEvent {
  id: string;
  title: string;
  time: string;
  description?: string;
}

export interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ events, className = '' }) => {
  return (
    <div className={`lims-timeline ${className}`}>
      {events.map((evt) => (
        <div key={evt.id} className="lims-timeline-item">
          <div className="lims-timeline-bullet" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h4 style={{ font: 'var(--type-label-default)', color: 'var(--color-text-primary)', margin: 0 }}>{evt.title}</h4>
            <span style={{ font: 'var(--type-body-small)', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{evt.time}</span>
          </div>
          {evt.description && (
            <p style={{ font: 'var(--type-body-small)', color: 'var(--color-text-secondary)', marginTop: '4px', margin: 0 }}>
              {evt.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
