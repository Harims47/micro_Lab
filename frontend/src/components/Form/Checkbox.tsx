import React from 'react';
import './Form.css';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  description,
  error,
  id,
  className = '',
  ...props
}) => {
  const checkboxId = id || `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`lims-form-group ${className}`}>
      <label htmlFor={checkboxId} className="lims-checkbox-container">
        <input
          type="checkbox"
          id={checkboxId}
          className="lims-checkbox"
          aria-invalid={!!error}
          {...props}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ font: 'var(--type-body-default)', color: 'var(--color-text-primary)' }}>{label}</span>
          {description && <span className="lims-form-desc">{description}</span>}
        </div>
      </label>
      {error && (
        <span className="lims-form-error-msg" role="alert" style={{ marginTop: '2px' }}>
          <span>⚠️</span> {error}
        </span>
      )}
    </div>
  );
};
