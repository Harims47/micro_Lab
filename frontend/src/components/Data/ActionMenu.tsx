import React, { useState, useRef, useEffect } from 'react';
import { usePermission } from '../../infrastructure/permissions/usePermission';
import { MoreVertical } from 'lucide-react';
import './Data.css';

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  permission?: number;
  danger?: boolean;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  align?: 'left' | 'right';
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ items, align = 'right' }) => {
  const { hasPermission } = usePermission();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter items based on active role permissions bitmask
  const visibleItems = items.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  // Close dropdown on clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [open]);

  if (visibleItems.length === 0) return null;

  return (
    <div className="lims-action-menu-container" ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="lims-action-menu-trigger"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Action actions menu"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div
          className={`lims-action-menu-dropdown align-${align}`}
          role="menu"
          aria-label="Actions list"
        >
          {visibleItems.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className={`lims-action-menu-item ${item.danger ? 'danger' : ''}`}
              role="menuitem"
            >
              {item.icon && <span className="item-icon">{item.icon}</span>}
              <span className="item-label">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export default ActionMenu;
