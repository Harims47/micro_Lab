import React from 'react';
import './Form.css';

export interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  label,
  checked,
  onChange,
  description,
  disabled = false,
  className = ''
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className={`lims-form-group ${className}`}>
      <div
        className="lims-switch-label"
        onClick={handleToggle}
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        <div className={`lims-switch-track ${checked ? 'lims-switch-track-active' : ''}`} style={{ opacity: disabled ? 0.6 : 1 }}>
          <div className={`lims-switch-thumb ${checked ? 'lims-switch-thumb-active' : ''}`} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ font: 'var(--type-body-default)', color: 'var(--color-text-primary)', fontWeight: 500 }}>{label}</span>
          {description && <span className="lims-form-desc">{description}</span>}
        </div>
      </div>
    </div>
  );
};
