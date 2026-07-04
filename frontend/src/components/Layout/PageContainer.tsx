import React from 'react';
import './Layout.css';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = '1600px',
  className = '',
  style,
  ...props
}) => {
  return (
    <div
      className={`lims-page-container ${className}`}
      style={{
        maxWidth,
        margin: '0 auto',
        width: '100%',
        padding: 'var(--spacing-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
export default PageContainer;
