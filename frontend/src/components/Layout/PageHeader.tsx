import React from 'react';
import './Layout.css';
import { Breadcrumbs } from './Breadcrumbs';
import type { BreadcrumbItem } from './Breadcrumbs';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className = ''
}) => {
  return (
    <div className={`lims-page-header-container ${className}`}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="lims-page-header">
        <div>
          <h1 className="lims-heading-page" style={{ margin: 0 }}>{title}</h1>
          {subtitle && (
            <p className="lims-body-small" style={{ marginTop: '4px' }}>{subtitle}</p>
          )}
        </div>
        {actions && <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>{actions}</div>}
      </div>
    </div>
  );
};
