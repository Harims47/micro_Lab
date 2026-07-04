import React from 'react';
import './Laboratory.css';
import { Check } from 'lucide-react';

export interface WorkflowStep {
  label: string;
  status: 'pending' | 'active' | 'complete';
}

export interface WorkflowTimelineProps {
  steps: WorkflowStep[];
  className?: string;
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  steps,
  className = ''
}) => {
  return (
    <div className={`lims-workflow-timeline ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
      {steps.map((step, index) => {
        const isActive = step.status === 'active';
        const isComplete = step.status === 'complete';
        return (
          <div key={index} className="lims-workflow-step">
            <div
              className={`lims-workflow-step-circle ${
                isComplete ? 'lims-workflow-complete' : isActive ? 'lims-workflow-active' : ''
              }`}
            >
              {isComplete ? <Check size={12} /> : index + 1}
            </div>
            <span
              style={{
                font: 'var(--type-body-default)',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
              }}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
