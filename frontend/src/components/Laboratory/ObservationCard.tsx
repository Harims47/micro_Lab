import React from 'react';
import './Laboratory.css';
import { Card } from '../Layout';
import { SmallText, MonospaceCode } from '../Foundation';
import type { Observation } from '../../types';

export interface ObservationCardProps {
  observation: Observation;
  className?: string;
}

export const ObservationCard: React.FC<ObservationCardProps> = ({
  observation,
  className = ''
}) => {
  return (
    <Card className={`lims-obs-card ${className}`} elevation={1}>
      <div className="lims-obs-meta">
        <strong style={{ font: 'var(--type-label-default)', color: 'var(--color-text-primary)' }}>
          Growth Observation
        </strong>
        <SmallText>{new Date(observation.readAt).toLocaleString()}</SmallText>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)', margin: 'var(--spacing-xs) 0' }}>
        <MonospaceCode>{observation.gramReaction}</MonospaceCode>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          backgroundColor: observation.isContaminated ? 'var(--color-status-danger-bg)' : 'var(--color-status-success-bg)',
          color: observation.isContaminated ? 'var(--color-status-danger)' : 'var(--color-status-success)',
          padding: '2px 8px',
          borderRadius: '10px'
        }}>
          {observation.isContaminated ? 'CONTAMINATED' : 'PURE CULTURE'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: 'var(--spacing-xs)' }}>
        <span style={{ font: 'var(--type-body-small)', color: 'var(--color-text-primary)' }}>
          <strong>Colony Count:</strong> {observation.colonyCount}
        </span>
        <span style={{ font: 'var(--type-body-small)', color: 'var(--color-text-primary)' }}>
          <strong>Morphology:</strong> {observation.morphology}
        </span>
        {observation.notes && (
          <span style={{ font: 'var(--type-body-small)', color: 'var(--color-text-secondary)', fontStyle: 'italic', marginTop: '4px' }}>
            * {observation.notes}
          </span>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--color-border-default)', paddingTop: '6px', marginTop: 'var(--spacing-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SmallText style={{ fontSize: '0.7rem' }}>Recorded By: {observation.readBy}</SmallText>
        <SmallText style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>ID: {observation.observationId}</SmallText>
      </div>
    </Card>
  );
};
