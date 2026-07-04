import React from 'react';
import './Layout.css';

export interface SplitLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftRatio?: number; // e.g. 3 for 3:9, or 4 for 4:8. Default is 50-50 split.
  className?: string;
}

export const SplitLayout: React.FC<SplitLayoutProps> = ({
  left,
  right,
  leftRatio,
  className = ''
}) => {
  const leftStyle: React.CSSProperties = leftRatio
    ? { flex: leftRatio }
    : { flex: 1 };
  
  const rightStyle: React.CSSProperties = leftRatio
    ? { flex: 12 - leftRatio }
    : { flex: 1 };

  return (
    <div className={`lims-split-layout ${className}`}>
      <div className="lims-split-pane" style={leftStyle}>
        {left}
      </div>
      <div className="lims-split-pane" style={rightStyle}>
        {right}
      </div>
    </div>
  );
};
