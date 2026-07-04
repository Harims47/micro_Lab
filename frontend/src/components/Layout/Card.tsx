import React from 'react';
import './Layout.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 0 | 1 | 2 | 3;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevation = 1,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`lims-card lims-card-elevation-${elevation} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`lims-panel ${className}`} {...props}>
      {children}
    </div>
  );
};

export const Section: React.FC<PanelProps> = ({ children, className = '', ...props }) => {
  return (
    <section className={`lims-section ${className}`} {...props}>
      {children}
    </section>
  );
};
