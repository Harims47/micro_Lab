import React from 'react';
import './Form.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  description?: string;
  error?: string;
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  description,
  error,
  required = false,
  id,
  className = '',
  ...props
}) => {
  const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`lims-form-group ${className}`}>
      <label htmlFor={selectId} className="lims-form-label">
        <span>{label}</span>
        {required && <span className="lims-form-required" aria-hidden="true">*</span>}
      </label>
      {description && <span className="lims-form-desc">{description}</span>}
      <select
        id={selectId}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        className={`lims-input ${error ? 'lims-input-error' : ''}`}
        style={{ cursor: 'pointer' }}
        {...props}
      >
        <option value="">-- Select an option --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="lims-form-error-msg" role="alert">
          <span>⚠️</span> {error}
        </span>
      )}
    </div>
  );
};
