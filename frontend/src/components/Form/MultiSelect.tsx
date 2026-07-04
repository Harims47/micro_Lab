import React, { useState, useRef, useEffect } from 'react';
import './Form.css';

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  description,
  error,
  required = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleToggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleRemoveOption = (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== value));
  };

  const selectedLabels = options.filter((o) => selectedValues.includes(o.value));

  return (
    <div className={`lims-form-group ${className}`} ref={containerRef}>
      <label className="lims-form-label">
        <span>{label}</span>
        {required && <span className="lims-form-required" aria-hidden="true">*</span>}
      </label>
      {description && <span className="lims-form-desc">{description}</span>}
      
      <div style={{ position: 'relative' }}>
        <div
          className="lims-multiselect-trigger"
          onClick={() => setIsOpen(!isOpen)}
          role="combobox"
          aria-expanded={isOpen}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            } else if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
        >
          {selectedLabels.length === 0 ? (
            <span style={{ color: 'var(--color-text-disabled)', font: 'var(--type-body-default)' }}>Select items...</span>
          ) : (
            selectedLabels.map((opt) => (
              <span key={opt.value} className="lims-multiselect-badge">
                <span>{opt.label}</span>
                <button
                  type="button"
                  className="lims-multiselect-remove"
                  onClick={(e) => handleRemoveOption(e, opt.value)}
                  aria-label={`Remove ${opt.label}`}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>

        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--elevation-2)',
              zIndex: 10,
              maxHeight: '200px',
              overflowY: 'auto',
              marginTop: '4px'
            }}
            role="listbox"
          >
            {options.map((opt) => {
              const isChecked = selectedValues.includes(opt.value);
              return (
                <div
                  key={opt.value}
                  onClick={() => handleToggleOption(opt.value)}
                  style={{
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-xs)',
                    cursor: 'pointer',
                    backgroundColor: isChecked ? 'var(--color-surface-hover)' : 'transparent',
                    font: 'var(--type-body-default)',
                    color: 'var(--color-text-primary)'
                  }}
                  role="option"
                  aria-selected={isChecked}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="lims-checkbox"
                  />
                  <span>{opt.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <span className="lims-form-error-msg" role="alert">
          <span>⚠️</span> {error}
        </span>
      )}
    </div>
  );
};
