import React, { useState, useEffect } from 'react';
import './Data.css';
import { Button } from '../Foundation';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}) => {
  const [jumpVal, setJumpVal] = useState(String(currentPage));

  useEffect(() => {
    setJumpVal(String(currentPage));
  }, [currentPage]);

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpVal, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    } else {
      setJumpVal(String(currentPage));
    }
  };

  // Helper to compute smart page buttons list
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisibleNeighbors = 1; // Number of adjacent neighbors to show

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show First Page
      pages.push(1);

      const start = Math.max(2, currentPage - maxVisibleNeighbors);
      const end = Math.min(totalPages - 1, currentPage + maxVisibleNeighbors);

      // Render first ellipsis if adjacent bounds are split
      if (start > 2) {
        pages.push('...');
      }

      // Add neighbor items
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Render second ellipsis if adjacent bounds are split
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always show Last Page
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`lims-pagination-block ${className}`} style={styles.paginationBlock}>
      <div style={styles.buttonsWrapper}>
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          style={styles.navButton}
        >
          &lt; Previous
        </Button>
        
        <div className="lims-pagination-pages" style={styles.pagesContainer}>
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} style={styles.ellipsis}>
                  ...
                </span>
              );
            }
            const isActive = page === currentPage;
            return (
              <button
                key={`page-${page}`}
                type="button"
                className={`lims-page-btn ${isActive ? 'active' : ''}`}
                onClick={() => onPageChange(page as number)}
                style={{
                  ...styles.pageButton,
                  backgroundColor: isActive ? 'var(--color-brand-primary)' : 'transparent',
                  color: isActive ? 'white' : 'var(--color-text-primary)',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {page}
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          style={styles.navButton}
        >
          Next &gt;
        </Button>
      </div>

      {/* Jump to Page Box */}
      <form onSubmit={handleJumpSubmit} style={styles.jumpForm}>
        <label htmlFor="jump-to-page" style={styles.jumpLabel}>
          Jump to page
        </label>
        <input
          id="jump-to-page"
          type="text"
          value={jumpVal}
          onChange={(e) => setJumpVal(e.target.value)}
          onBlur={() => setJumpVal(String(currentPage))}
          style={styles.jumpInput}
          aria-label="Enter page number to jump to"
        />
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  paginationBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  buttonsWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  pagesContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  navButton: {
    minHeight: '32px',
    padding: '4px 12px',
    fontSize: '0.85rem',
  },
  pageButton: {
    minWidth: '32px',
    height: '32px',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-xs)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    font: 'var(--type-label-default)',
    fontSize: '0.85rem',
  },
  ellipsis: {
    padding: '0 6px',
    color: 'var(--color-text-secondary)',
    userSelect: 'none',
  },
  jumpForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  jumpLabel: {
    font: 'var(--type-body-small)',
    color: 'var(--color-text-secondary)',
    fontSize: '0.8rem',
  },
  jumpInput: {
    width: '46px',
    height: '32px',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-xs)',
    textAlign: 'center',
    backgroundColor: 'var(--color-surface-raised)',
    color: 'var(--color-text-primary)',
    font: 'var(--type-body-default)',
    fontSize: '0.85rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
};
export default Pagination;
