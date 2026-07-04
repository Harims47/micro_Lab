import React, { useState } from 'react';
import './Layout.css';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultTabId,
  className = ''
}) => {
  const [activeTabId, setActiveTabId] = useState(defaultTabId || items[0]?.id);

  return (
    <div className={`lims-tabs-container ${className}`}>
      <div className="lims-tabs-header" role="tablist">
        {items.map((item) => {
          const isActive = activeTabId === item.id;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${item.id}`}
              id={`tab-${item.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTabId(item.id)}
              className={`lims-tab-btn ${isActive ? 'lims-tab-btn-active' : ''}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      
      {items.map((item) => {
        const isActive = activeTabId === item.id;
        return (
          <div
            key={item.id}
            id={`panel-${item.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${item.id}`}
            hidden={!isActive}
            className="lims-tab-panel"
          >
            {item.content}
          </div>
        );
      })}
    </div>
  );
};
