import React from 'react';
import './Layout.css';

export interface StepItem {
  id: string;
  label: string;
}

export interface StepperProps {
  steps: StepItem[];
  activeStepIndex: number;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStepIndex,
  className = ''
}) => {
  const progressPercent = steps.length > 1
    ? (activeStepIndex / (steps.length - 1)) * 100
    : 0;

  return (
    <div className={`lims-stepper ${className}`} role="progressbar" aria-valuemin={0} aria-valuemax={steps.length - 1} aria-valuenow={activeStepIndex}>
      <div className="lims-stepper-line">
        <div className="lims-stepper-line-fill" style={{ width: `${progressPercent}%` }} />
      </div>
      
      {steps.map((step, index) => {
        const isActive = index === activeStepIndex;
        const isCompleted = index < activeStepIndex;
        return (
          <div key={step.id} className="lims-step">
            <div
              className={`lims-step-circle ${
                isCompleted
                  ? 'lims-step-circle-completed'
                  : isActive
                  ? 'lims-step-circle-active'
                  : ''
              }`}
            >
              {isCompleted ? '✓' : index + 1}
            </div>
            <span
              className={`lims-step-label ${isActive ? 'lims-step-label-active' : ''}`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
