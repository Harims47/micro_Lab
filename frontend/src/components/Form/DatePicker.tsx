import React from 'react';
import './Form.css';

export interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  description,
  error,
  required = false,
  id,
  className = '',
  ...props
}) => {
  const pickerId = id || `date-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`lims-form-group ${className}`}>
      <label htmlFor={pickerId} className="lims-form-label">
        <span>{label}</span>
        {required && <span className="lims-form-required" aria-hidden="true">*</span>}
      </label>
      {description && <span className="lims-form-desc">{description}</span>}
      <input
        type="date"
        id={pickerId}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        className={`lims-input ${error ? 'lims-input-error' : ''}`}
        {...props}
      />
      {error && (
        <span className="lims-form-error-msg" role="alert">
          <span>⚠️</span> {error}
        </span>
      )}
    </div>
  );
};
