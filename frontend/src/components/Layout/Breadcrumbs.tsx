import React from 'react';
import { Link } from 'react-router-dom';
import './Layout.css';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = ''
}) => {
  return (
    <nav aria-label="Breadcrumb" className={`lims-breadcrumbs ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="lims-breadcrumb-item">
            {item.path && !isLast ? (
              <Link
                to={item.path}
                style={{ color: 'inherit', textDecoration: 'none' }}
                className="lims-breadcrumb-link"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'lims-breadcrumb-active' : ''}>
                {item.label}
              </span>
            )}
            {!isLast && (
              <span className="lims-breadcrumb-separator" aria-hidden="true">
                /
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
};
