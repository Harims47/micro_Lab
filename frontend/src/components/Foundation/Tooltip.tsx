import React from 'react';
import './Foundation.css';

export interface TooltipProps {
  content: string;
  children: React.ReactElement;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  className = ''
}) => {
  return (
    <div className={`lims-tooltip-container ${className}`}>
      {React.cloneElement(children, {
        'aria-describedby': 'lims-tooltip-box-id'
      } as any)}
      <div id="lims-tooltip-box-id" className="lims-tooltip-box" role="tooltip">
        {content}
      </div>
    </div>
  );
};
