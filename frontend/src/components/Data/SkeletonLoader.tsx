import React from 'react';
import './Data.css';

export interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  shape?: 'text' | 'rect' | 'circle';
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = '16px',
  shape = 'rect',
  count = 1,
  className = ''
}) => {
  const items = Array.from({ length: count });

  const getStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {
      width,
      height,
      marginBottom: count > 1 ? 'var(--spacing-xs)' : 0
    };
    if (shape === 'circle') {
      style.borderRadius = '50%';
      style.width = height; // Maintain aspect ratio for circles
    } else if (shape === 'text') {
      style.height = '12px';
      style.borderRadius = '4px';
    }
    return style;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {items.map((_, idx) => (
        <div
          key={idx}
          className={`lims-skeleton ${className}`}
          style={getStyle()}
          role="presentation"
          aria-hidden="true"
        />
      ))}
    </div>
  );
};
