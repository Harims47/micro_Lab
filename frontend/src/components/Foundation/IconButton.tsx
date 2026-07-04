import React from 'react';
import './Foundation.css';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`lims-icon-btn ${className}`}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={label}
      title={label}
      {...props}
    >
      {icon}
    </button>
  );
};
