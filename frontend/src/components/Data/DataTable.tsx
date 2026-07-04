import React, { useState } from 'react';
import './Data.css';

export interface ColumnDef<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  rowKey: keyof T;
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectKeys?: (keys: string[]) => void;
  className?: string;
}

export const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  selectable = false,
  selectedKeys = [],
  onSelectKeys,
  className = ''
}: DataTableProps<T>) => {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectKeys) {
      if (e.target.checked) {
        onSelectKeys(data.map((row) => String(row[rowKey])));
      } else {
        onSelectKeys([]);
      }
    }
  };

  const handleSelectRow = (key: string, checked: boolean) => {
    if (onSelectKeys) {
      if (checked) {
        onSelectKeys([...selectedKeys, key]);
      } else {
        onSelectKeys(selectedKeys.filter((k) => k !== key));
      }
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    const sorted = [...data];
    sorted.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      const comparison = valA > valB ? 1 : -1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [data, sortKey, sortOrder]);

  return (
    <div className={`lims-data-table-container ${className}`}>
      <table className="lims-data-table">
        <thead>
          <tr>
            {selectable && (
              <th className="lims-data-table-th" style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  checked={data.length > 0 && selectedKeys.length === data.length}
                  onChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((col) => {
              const isSorted = sortKey === col.key;
              return (
                <th
                  key={String(col.key)}
                  className="lims-data-table-th"
                  style={{ cursor: col.sortable ? 'pointer' : 'default' }}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                  aria-sort={isSorted ? (sortOrder === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>{col.label}</span>
                    {col.sortable && (
                      <span style={{ fontSize: '0.75rem', opacity: isSorted ? 1 : 0.4 }}>
                        {isSorted ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-secondary)' }}>
                No records found.
              </td>
            </tr>
          ) : (
            sortedData.map((row) => {
              const keyVal = String(row[rowKey]);
              const isChecked = selectedKeys.includes(keyVal);
              return (
                <tr key={keyVal} className="lims-data-table-row">
                  {selectable && (
                    <td className="lims-data-table-td">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleSelectRow(keyVal, e.target.checked)}
                        aria-label={`Select row ${keyVal}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={String(col.key)} className="lims-data-table-td">
                      {col.render ? col.render(row) : row[col.key as string]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
