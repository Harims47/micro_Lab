import React, { useState } from 'react';
import { Card } from '../Layout/Card';
import { Button } from '../Foundation/Button';
import { useNotification } from '../../infrastructure/notifications/useNotification';

export interface NoteItem {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  category: 'Internal' | 'Clinical' | 'Laboratory' | 'Quality' | 'System';
  content: string;
  mentions?: string[];
  isEdited?: boolean;
}

interface NotesPanelProps {
  notes: NoteItem[];
  onAddNote: (note: { category: NoteItem['category']; content: string; mentions?: string[] }) => void;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ notes, onAddNote }) => {
  const { addToast } = useNotification();
  const [filterCategory, setFilterCategory] = useState<string>('All');
  
  // Create note states
  const [category, setCategory] = useState<NoteItem['category']>('Laboratory');
  const [content, setContent] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    // Detect @mentions
    const words = content.split(/\s+/);
    const mentions = words
      .filter((w) => w.startsWith('@'))
      .map((w) => w.substring(1).replace(/[^a-zA-Z0-9]/g, ''));

    onAddNote({
      category,
      content,
      mentions: mentions.length > 0 ? mentions : undefined,
    });

    addToast('success', 'Comment log entry added.');
    setContent('');
  };

  const filtered = notes.filter((n) => filterCategory === 'All' || n.category === filterCategory);

  const getCategoryColor = (cat: NoteItem['category']) => {
    switch (cat) {
      case 'Clinical': return 'var(--color-status-success)';
      case 'Quality': return 'var(--color-status-danger)';
      case 'System': return 'var(--color-text-secondary)';
      case 'Internal': return 'orange';
      default: return 'var(--color-brand-primary)';
    }
  };

  return (
    <Card style={styles.container}>
      <div style={styles.header}>
        <h4 style={styles.title}>Requisition notes & Clinical logs</h4>
        <div style={styles.filters}>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="lims-input"
            style={styles.select}
          >
            <option value="All">All Notes</option>
            <option value="Internal">Internal Notes</option>
            <option value="Clinical">Clinical Notes</option>
            <option value="Laboratory">Laboratory Notes</option>
            <option value="Quality">Quality Notes</option>
            <option value="System">System Notes</option>
          </select>
        </div>
      </div>

      {/* Feed list */}
      <div style={styles.feedList}>
        {filtered.length === 0 ? (
          <p style={{ margin: 0, font: 'var(--type-body-small)', color: 'var(--color-text-secondary)' }}>
            No comments logged under this profile.
          </p>
        ) : (
          filtered.map((note) => (
            <div key={note.id} style={styles.feedItem}>
              <div style={styles.feedItemHeader}>
                <div>
                  <strong>{note.author}</strong> ({note.role})
                  <span
                    style={{
                      marginLeft: '8px',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      color: getCategoryColor(note.category),
                    }}
                  >
                    [{note.category}]
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'gray' }}>
                  {new Date(note.timestamp).toLocaleString()} {note.isEdited && '(edited)'}
                </span>
              </div>
              <p style={styles.content}>{note.content}</p>
              
              {/* Mentions tag list */}
              {note.mentions && note.mentions.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                  {note.mentions.map((user) => (
                    <span key={user} style={styles.mentionBadge}>
                      @{user}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input form */}
      <form onSubmit={handleAdd} style={styles.form}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as NoteItem['category'])}
            className="lims-input"
            style={{ width: '120px', height: '36px' }}
          >
            <option value="Internal">Internal</option>
            <option value="Clinical">Clinical</option>
            <option value="Laboratory">Laboratory</option>
            <option value="Quality">Quality</option>
          </select>

          <input
            type="text"
            className="lims-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type comment log... Support @mentions (e.g. @Sarah)"
            style={{ flex: 1, padding: '0 8px', boxSizing: 'border-box' }}
            required
          />

          <Button variant="solid" type="submit">
            Add
          </Button>
        </div>
      </form>
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
  },
  select: {
    height: '30px',
    fontSize: '0.8rem',
  },
  feedList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '180px',
    overflowY: 'auto',
    paddingRight: '4px',
  },
  feedItem: {
    padding: '8px',
    backgroundColor: 'var(--color-surface-base)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-xs)',
  },
  feedItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.75rem',
  },
  content: {
    margin: '6px 0 0 0',
    fontSize: '0.82rem',
    color: 'var(--color-text-primary)',
  },
  mentionBadge: {
    padding: '1px 5px',
    borderRadius: '4px',
    backgroundColor: 'rgba(0,0,255,0.06)',
    color: 'blue',
    fontSize: '0.68rem',
    fontWeight: 'bold',
  },
  form: {
    borderTop: '1px solid var(--color-border-default)',
    paddingTop: 'var(--spacing-sm)',
  },
};
export default NotesPanel;
