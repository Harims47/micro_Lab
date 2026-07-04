import React from 'react';
import './Form.css';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioProps {
  label: string;
  name: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export const Radio: React.FC<RadioProps> = ({
  label,
  name,
  options,
  selectedValue,
  onChange,
  description,
  error,
  required = false,
  className = ''
}) => {
  return (
    <div className={`lims-form-group ${className}`} role="radiogroup" aria-required={required}>
      <span className="lims-form-label">
        <span>{label}</span>
        {required && <span className="lims-form-required" aria-hidden="true">*</span>}
      </span>
      {description && <span className="lims-form-desc">{description}</span>}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', marginTop: '4px' }}>
        {options.map((opt) => {
          const optId = `radio-${name}-${opt.value}`;
          return (
            <label key={opt.value} htmlFor={optId} className="lims-checkbox-container">
              <input
                type="radio"
                id={optId}
                name={name}
                value={opt.value}
                checked={selectedValue === opt.value}
                onChange={() => onChange(opt.value)}
                className="lims-checkbox"
                style={{ borderRadius: '50%' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ font: 'var(--type-body-default)', color: 'var(--color-text-primary)' }}>{opt.label}</span>
                {opt.description && <span className="lims-form-desc">{opt.description}</span>}
              </div>
            </label>
          );
        })}
      </div>

      {error && (
        <span className="lims-form-error-msg" role="alert">
          <span>⚠️</span> {error}
        </span>
      )}
    </div>
  );
};
