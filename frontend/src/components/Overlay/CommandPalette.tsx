import React, { useEffect, useRef } from 'react';
import './Overlay.css';
import { Search } from 'lucide-react';

export interface CommandPaletteResult {
  type: string;
  title: string;
  onSelect: () => void;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onChangeQuery: (val: string) => void;
  results: CommandPaletteResult[];
  placeholder?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  query,
  onChangeQuery,
  results,
  placeholder = 'Search navigation or identifiers...'
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="lims-backdrop" onClick={onClose}>
      <div className="lims-command-palette" onClick={(e) => e.stopPropagation()} role="combobox" aria-expanded={true}>
        <div className="lims-cp-header">
          <Search size={18} style={{ color: 'var(--color-text-secondary)' }} />
          <input
            ref={inputRef}
            type="text"
            className="lims-cp-input"
            placeholder={placeholder}
            value={query}
            onChange={(e) => onChangeQuery(e.target.value)}
          />
          <button
            onClick={onClose}
            style={{ fontSize: '0.7rem', backgroundColor: 'var(--color-surface-base)', border: '1px solid var(--color-border-default)', padding: '2px 6px', borderRadius: 'var(--radius-xs)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
          >
            ESC
          </button>
        </div>

        <div className="lims-cp-results">
          {results.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)', font: 'var(--type-body-small)' }}>
              No matches found.
            </div>
          ) : (
            results.map((res, index) => (
              <div
                key={index}
                onClick={() => {
                  res.onSelect();
                  onClose();
                }}
                className="lims-cp-item"
              >
                <span style={{ font: 'var(--type-body-default)', color: 'var(--color-text-primary)' }}>{res.title}</span>
                <span style={{ font: 'var(--type-body-small)', fontSize: '0.7rem', backgroundColor: 'var(--color-surface-base)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-border-default)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  {res.type}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
