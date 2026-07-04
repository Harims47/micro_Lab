import React, { useState } from 'react';
import type { BiochemicalResult } from '../models/types';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { TextInput } from '../../../components/Form/TextInput';

interface BiochemicalPanelProps {
  initialTests?: BiochemicalResult[];
  onSave: (tests: BiochemicalResult[]) => void;
}

export const BiochemicalPanel: React.FC<BiochemicalPanelProps> = ({ initialTests = [], onSave }) => {
  const defaultTests: BiochemicalResult['testName'][] = [
    'Catalase',
    'Coagulase',
    'Oxidase',
    'Indole',
    'Urease',
    'Citrate',
    'Triple Sugar Iron (TSI)',
  ];

  const [tests, setTests] = useState<BiochemicalResult[]>(() => {
    if (initialTests.length > 0) return initialTests;
    return defaultTests.map((testName) => ({
      testName,
      result: 'Not Performed',
      performedBy: 'tech_user',
      timestamp: new Date().toISOString(),
    }));
  });

  const handleResultChange = (idx: number, result: BiochemicalResult['result']) => {
    const updated = [...tests];
    updated[idx] = {
      ...updated[idx],
      result,
      timestamp: new Date().toISOString(),
    };
    setTests(updated);
  };

  const handleNotesChange = (idx: number, notes: string) => {
    const updated = [...tests];
    updated[idx] = {
      ...updated[idx],
      notes,
    };
    setTests(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out tests that were not performed
    const performed = tests.filter((t) => t.result !== 'Not Performed');
    onSave(performed);
  };

  return (
    <Card style={styles.container}>
      <h4 style={styles.title}>Enzymatic & Biochemical Assay Panels</h4>
      
      <form onSubmit={handleSave}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Biochemical Test</th>
                <th style={styles.th}>Reaction Result</th>
                <th style={styles.th}>Remarks / Notes</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t, idx) => (
                <tr key={t.testName} style={styles.tr}>
                  <td style={styles.td}><strong>{t.testName}</strong></td>
                  <td style={styles.td}>
                    <select
                      value={t.result}
                      onChange={(e) => handleResultChange(idx, e.target.value as any)}
                      className="lims-input"
                      style={styles.select}
                    >
                      <option value="Not Performed">Not Performed</option>
                      <option value="Positive">Positive (+)</option>
                      <option value="Negative">Negative (-)</option>
                      <option value="Weak Positive">Weak Positive</option>
                      <option value="Delayed">Delayed Reaction</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <TextInput
                      label=""
                      value={t.notes || ''}
                      onChange={(e) => handleNotesChange(idx, e.target.value)}
                      placeholder="e.g. Gas production visible, bubble format..."
                      style={{ margin: 0 }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <Button variant="solid" type="submit">
            Save Biochemical Panel
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
  title: {
    font: 'var(--type-heading-item)',
    margin: 0,
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: '4px',
  },
  tableWrapper: {
    overflowX: 'auto',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-xs)',
    marginTop: '8px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
  },
  th: {
    backgroundColor: 'var(--color-surface-base)',
    borderBottom: '1px solid var(--color-border-default)',
    padding: '10px 12px',
    textAlign: 'left',
    color: 'var(--color-text-secondary)',
    fontWeight: 'bold',
  },
  td: {
    padding: '6px 12px',
    borderBottom: '1px solid var(--color-border-default)',
  },
  tr: {
    transition: 'background-color 0.2s',
  },
  select: {
    height: '32px',
    width: '100%',
  },
};
export default BiochemicalPanel;
