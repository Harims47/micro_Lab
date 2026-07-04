import React from 'react';
import './Data.css';

export interface FilterItem {
  key: string;
  label: string;
  valueLabel: string;
}

export interface FiltersProps {
  items: FilterItem[];
  onRemoveFilter: (key: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export const Filters: React.FC<FiltersProps> = ({
  items,
  onRemoveFilter,
  onClearAll,
  className = ''
}) => {
  if (items.length === 0) return null;

  return (
    <div className={`lims-filters-container ${className}`}>
      <span style={{ font: 'var(--type-body-small)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Active Filters:</span>
      {items.map((item) => (
        <span key={item.key} className="lims-filter-chip">
          <span>{item.label}: <strong>{item.valueLabel}</strong></span>
          <button
            type="button"
            className="lims-filter-chip-remove"
            onClick={() => onRemoveFilter(item.key)}
            aria-label={`Remove filter ${item.label}`}
          >
            ×
          </button>
        </span>
      ))}
      {onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--color-brand-primary)',
            font: 'var(--type-body-small)',
            cursor: 'pointer',
            fontWeight: 500,
            textDecoration: 'underline'
          }}
        >
          Clear All
        </button>
      )}
    </div>
  );
};
