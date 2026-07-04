import React, { useState } from 'react';
import { Card } from '../Layout/Card';
import { CheckCircle, AlertTriangle, AlertOctagon, Info, ChevronDown, ChevronUp } from 'lucide-react';

export interface TimelineEventItem {
  id: string;
  title: string;
  time: string;
  description?: string;
  severity: 'Info' | 'Warning' | 'Success' | 'Critical';
  performedBy: string;
  role: string;
  comments?: string;
  attachments?: { filename: string; url: string }[];
}

interface TimelineViewerProps {
  events: TimelineEventItem[];
}

export const TimelineViewer: React.FC<TimelineViewerProps> = ({ events }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getSeverityIcon = (sev: TimelineEventItem['severity']) => {
    switch (sev) {
      case 'Success':
        return <CheckCircle size={16} color="green" />;
      case 'Warning':
        return <AlertTriangle size={16} color="orange" />;
      case 'Critical':
        return <AlertOctagon size={16} color="red" />;
      default:
        return <Info size={16} color="var(--color-brand-primary)" />;
    }
  };

  const getSeverityBg = (sev: TimelineEventItem['severity']) => {
    switch (sev) {
      case 'Success':
        return 'rgba(0,128,0,0.05)';
      case 'Warning':
        return 'rgba(255,165,0,0.05)';
      case 'Critical':
        return 'rgba(255,0,0,0.05)';
      default:
        return 'rgba(0,0,255,0.05)';
    }
  };

  const filteredEvents = events.filter(
    (e) => filterSeverity === 'All' || e.severity === filterSeverity
  );

  // Group events by date string
  const groupedEvents = filteredEvents.reduce<Record<string, TimelineEventItem[]>>((acc, item) => {
    const dateStr = new Date(item.time).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(item);
    return acc;
  }, {});

  return (
    <Card style={styles.container}>
      <div style={styles.header}>
        <h4 style={styles.title}>Audited Chain of Custody Timeline</h4>
        <div style={styles.filters}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Filter Severity:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="lims-input"
            style={styles.select}
          >
            <option value="All">All Severities</option>
            <option value="Info">Info</option>
            <option value="Success">Success</option>
            <option value="Warning">Warning</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      <div style={styles.timelineBody}>
        {Object.keys(groupedEvents).length === 0 ? (
          <p style={{ font: 'var(--type-body-small)', color: 'var(--color-text-secondary)' }}>
            No timeline matches the filter parameters.
          </p>
        ) : (
          Object.entries(groupedEvents).map(([dateStr, list]) => (
            <div key={dateStr} style={{ marginBottom: 'var(--spacing-md)' }}>
              <div style={styles.dateHeader}>{dateStr}</div>
              <div style={styles.listWrapper}>
                {list.map((evt) => {
                  const isExpanded = expandedId === evt.id;
                  return (
                    <div key={evt.id} style={{ ...styles.eventRow, backgroundColor: getSeverityBg(evt.severity) }}>
                      <div style={styles.timelineIconLine}>
                        <div style={styles.iconNode}>{getSeverityIcon(evt.severity)}</div>
                        <div style={styles.lineDot} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div
                          style={styles.rowClickable}
                          onClick={() => setExpandedId(isExpanded ? null : evt.id)}
                        >
                          <div style={{ flex: 1 }}>
                            <strong>{evt.title}</strong>
                            <p style={styles.subtitle}>
                              {new Date(evt.time).toLocaleTimeString()} | Operator: {evt.performedBy} ({evt.role})
                            </p>
                          </div>
                          <div>{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
                        </div>

                        {isExpanded && (
                          <div style={styles.expandedContent}>
                            {evt.description && <p style={{ margin: '0 0 8px 0' }}>{evt.description}</p>}
                            {evt.comments && (
                              <div style={styles.commentsCard}>
                                <strong>Log commentary:</strong>
                                <p style={{ margin: '4px 0 0 0', fontStyle: 'italic' }}>{evt.comments}</p>
                              </div>
                            )}
                            {evt.attachments && evt.attachments.length > 0 && (
                              <div style={{ marginTop: '8px' }}>
                                <strong style={{ fontSize: '0.75rem' }}>Related documents:</strong>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                  {evt.attachments.map((att, idx) => (
                                    <span key={idx} style={styles.attTag}>
                                      📎 {att.filename}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 'var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: '6px',
  },
  title: {
    font: 'var(--type-heading-item)',
    margin: 0,
  },
  filters: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  select: {
    height: '30px',
    padding: '0 4px',
    fontSize: '0.8rem',
  },
  timelineBody: {
    position: 'relative',
    paddingLeft: '6px',
  },
  dateHeader: {
    fontWeight: 'bold',
    fontSize: '0.85rem',
    color: 'var(--color-brand-primary)',
    margin: '12px 0 6px 0',
  },
  listWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  eventRow: {
    display: 'flex',
    gap: '12px',
    padding: '8px 12px',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-sm)',
  },
  timelineIconLine: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconNode: {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineDot: {
    width: '2px',
    flexGrow: 1,
    backgroundColor: 'var(--color-border-default)',
    marginTop: '4px',
    minHeight: '12px',
  },
  rowClickable: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '0.72rem',
    color: 'var(--color-text-secondary)',
  },
  expandedContent: {
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid var(--color-border-default)',
    fontSize: '0.82rem',
  },
  commentsCard: {
    backgroundColor: 'var(--color-surface-base)',
    padding: '6px 10px',
    borderRadius: '4px',
    marginTop: '6px',
    fontSize: '0.78rem',
  },
  attTag: {
    fontSize: '0.7rem',
    padding: '2px 6px',
    backgroundColor: 'var(--color-brand-secondary-bg)',
    color: 'var(--color-brand-primary)',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};
export default TimelineViewer;
