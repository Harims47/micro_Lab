import React from 'react';
import './Form.css';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
  success?: boolean;
  required?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  description,
  error,
  success = false,
  required = false,
  type = 'text',
  id,
  className = '',
  ...props
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`lims-form-group ${className}`}>
      <label htmlFor={inputId} className="lims-form-label">
        <span>{label}</span>
        {required && <span className="lims-form-required" aria-hidden="true">*</span>}
      </label>
      {description && <span className="lims-form-desc">{description}</span>}
      <input
        type={type}
        id={inputId}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        className={`lims-input ${error ? 'lims-input-error' : success ? 'lims-input-success' : ''}`}
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
