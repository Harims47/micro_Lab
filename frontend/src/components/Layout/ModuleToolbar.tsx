import React from 'react';
import { SearchBox } from '../Data/SearchBox';
import { Filters, type FilterItem } from '../Data/Filters';
import { RefreshCw, Download, Plus } from 'lucide-react';
import { Button } from '../Foundation/Button';
import './Layout.css';

export interface ModuleToolbarProps {
  title: string;
  subtitle?: string;
  searchValue: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  filterItems?: FilterItem[];
  onRemoveFilter?: (key: string) => void;
  onClearAllFilters?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onCreate?: () => void;
  createLabel?: string;
  extraFilters?: React.ReactNode;
  extraActions?: React.ReactNode;
  className?: string;
}

export const ModuleToolbar: React.FC<ModuleToolbarProps> = ({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterItems = [],
  onRemoveFilter,
  onClearAllFilters,
  onRefresh,
  onExport,
  onCreate,
  createLabel = 'Create Record',
  extraFilters,
  extraActions,
  className = '',
}) => {
  return (
    <div className={`lims-module-toolbar-container ${className}`}>
      {/* Upper Block: Title and Actions */}
      <div className="lims-module-toolbar-header">
        <div>
          <h2 className="lims-heading-section" style={{ margin: 0 }}>{title}</h2>
          {subtitle && (
            <p className="lims-body-small" style={{ margin: '2px 0 0 0', color: 'var(--color-text-secondary)' }}>
              {subtitle}
            </p>
          )}
        </div>

        <div className="lims-module-toolbar-actions">
          {extraActions}
          {onExport && (
            <Button variant="outline" onClick={onExport} title="Export Data">
              <Download size={14} style={{ marginRight: '6px' }} />
              Export
            </Button>
          )}
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh} title="Refresh Directory" style={{ minWidth: '40px', padding: '8px' }}>
              <RefreshCw size={14} />
            </Button>
          )}
          {onCreate && (
            <Button variant="solid" onClick={onCreate}>
              <Plus size={14} style={{ marginRight: '6px' }} />
              {createLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Lower Block: Search and Filters */}
      <div className="lims-module-toolbar-search-row">
        <div className="lims-module-toolbar-search-box">
          <SearchBox
            value={searchValue}
            onChangeValue={onSearchChange}
            placeholder={searchPlaceholder}
            style={{ width: '100%' }}
          />
        </div>
        
        {extraFilters && (
          <div className="lims-module-toolbar-extra-filters">
            {extraFilters}
          </div>
        )}
      </div>

      {/* Filter Chips row */}
      {filterItems.length > 0 && onRemoveFilter && (
        <div className="lims-module-toolbar-chips">
          <Filters
            items={filterItems}
            onRemoveFilter={onRemoveFilter}
            onClearAll={onClearAllFilters}
          />
        </div>
      )}
    </div>
  );
};
export default ModuleToolbar;
