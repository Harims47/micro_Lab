import React from 'react';
import './Foundation.css';

interface BaseProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const PageTitle: React.FC<BaseProps> = ({ children, className = '', style }) => (
  <h1 className={`lims-heading-page ${className}`} style={style}>{children}</h1>
);

export const SectionTitle: React.FC<BaseProps> = ({ children, className = '', style }) => (
  <h2 className={`lims-heading-section ${className}`} style={style}>{children}</h2>
);

export const SubsectionTitle: React.FC<BaseProps> = ({ children, className = '', style }) => (
  <h3 className={`lims-heading-subsection ${className}`} style={style}>{children}</h3>
);

export const BodyText: React.FC<BaseProps> = ({ children, className = '', style }) => (
  <p className={`lims-body-text ${className}`} style={style}>{children}</p>
);

export const SmallText: React.FC<BaseProps> = ({ children, className = '', style }) => (
  <span className={`lims-body-small ${className}`} style={style}>{children}</span>
);

export const MonospaceCode: React.FC<BaseProps> = ({ children, className = '', style }) => (
  <code className={`lims-code-text ${className}`} style={style}>{children}</code>
);
