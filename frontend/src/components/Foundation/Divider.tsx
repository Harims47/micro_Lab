import React from 'react';
import './Foundation.css';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  className = ''
}) => {
  return (
    <hr
      className={`lims-divider lims-divider-${orientation} ${className}`}
      aria-orientation={orientation}
    />
  );
};
