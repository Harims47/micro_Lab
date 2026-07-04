import React, { useState } from 'react';
import './Layout.css';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  className = ''
}) => {
  const [openIds, setOpenIds] = useState<string[]>([]);

  const handleToggle = (id: string) => {
    if (allowMultiple) {
      if (openIds.includes(id)) {
        setOpenIds(openIds.filter((item) => item !== id));
      } else {
        setOpenIds([...openIds, id]);
      }
    } else {
      if (openIds.includes(id)) {
        setOpenIds([]);
      } else {
        setOpenIds([id]);
      }
    }
  };

  return (
    <div className={`lims-accordion-container ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div key={item.id} className="lims-accordion-item">
            <div
              className="lims-accordion-header"
              onClick={() => handleToggle(item.id)}
              role="button"
              aria-expanded={isOpen}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleToggle(item.id);
                }
              }}
            >
              <span>{item.title}</span>
              <span>{isOpen ? '▲' : '▼'}</span>
            </div>
            {isOpen && (
              <div className="lims-accordion-content" role="region">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
