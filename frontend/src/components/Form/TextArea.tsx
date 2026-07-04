import React from 'react';
import './Form.css';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  description,
  error,
  required = false,
  id,
  className = '',
  ...props
}) => {
  const textareaId = id || `textarea-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`lims-form-group ${className}`}>
      <label htmlFor={textareaId} className="lims-form-label">
        <span>{label}</span>
        {required && <span className="lims-form-required" aria-hidden="true">*</span>}
      </label>
      {description && <span className="lims-form-desc">{description}</span>}
      <textarea
        id={textareaId}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        className={`lims-input ${error ? 'lims-input-error' : ''}`}
        style={{ minHeight: '80px', resize: 'vertical' }}
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
