import React, { useState } from 'react';
import type { AntibioticAgentResult, Interpretation } from '../models/types';
import { interpretAntibioticResult } from '../api/mockAstServer';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';

interface AstWorksheetProps {
  agents: AntibioticAgentResult[];
  guideline: 'CLSI 2026' | 'EUCAST 2026';
  readOnly?: boolean;
  onSave?: (agents: AntibioticAgentResult[]) => void;
}

const INTERP_STYLE: Record<string, React.CSSProperties> = {
  S: { backgroundColor: 'rgba(34,197,94,0.1)', color: '#16a34a', fontWeight: 700 },
  I: { backgroundColor: 'rgba(245,158,11,0.1)', color: '#d97706', fontWeight: 700 },
  R: { backgroundColor: 'rgba(239,68,68,0.1)', color: '#dc2626', fontWeight: 700 },
  'Not Tested': { color: 'var(--color-text-secondary)', fontStyle: 'italic' },
  Invalid: { color: 'crimson', fontStyle: 'italic' },
};

export const AstWorksheet: React.FC<AstWorksheetProps> = ({
  agents: initialAgents,
  guideline,
  readOnly = false,
  onSave,
}) => {
  const [rows, setRows] = useState<AntibioticAgentResult[]>(initialAgents);

  const updateRow = (idx: number, changes: Partial<AntibioticAgentResult>) => {
    const updated = [...rows];
    const current = { ...updated[idx], ...changes };

    // Auto-interpret when value changes
    if (changes.value !== undefined || changes.method !== undefined) {
      current.interpretation = interpretAntibioticResult(
        current.agentId,
        current.method,
        current.value,
        guideline
      );
    }
    updated[idx] = current;
    setRows(updated);
  };

  const effectiveInterp = (row: AntibioticAgentResult): Interpretation =>
    row.overrideInterpretation ?? row.interpretation;

  return (
    <Card style={styles.container}>
      <div style={styles.header}>
        <h4 style={styles.title}>Antibiotic Susceptibility Worksheet</h4>
        <span style={styles.guidelinePill}>{guideline}</span>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Antibiotic</th>
              <th style={styles.th}>Method</th>
              <th style={styles.th}>Value</th>
              <th style={styles.th}>Unit</th>
              <th style={styles.th}>Interpretation</th>
              <th style={styles.th}>Override</th>
              <th style={styles.th}>Override Reason</th>
              <th style={styles.th}>Comments</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const interp = effectiveInterp(row);
              return (
                <tr key={row.agentId} style={styles.tr}>
                  {/* Antibiotic name */}
                  <td style={styles.td}>
                    <strong>{row.agentName}</strong>
                    <div style={{ fontSize: '0.7rem', color: 'gray' }}>{row.agentId}</div>
                  </td>

                  {/* Method */}
                  <td style={styles.td}>
                    {readOnly ? (
                      <span>{row.method}</span>
                    ) : (
                      <select
                        value={row.method}
                        onChange={(e) => updateRow(idx, { method: e.target.value as any })}
                        className="lims-input"
                        style={styles.narrowSelect}
                      >
                        <option value="Disk Diffusion">Disk Diffusion</option>
                        <option value="MIC">MIC</option>
                        <option value="Broth Microdilution">Broth Micro.</option>
                        <option value="E-test">E-test</option>
                      </select>
                    )}
                  </td>

                  {/* Value */}
                  <td style={styles.td}>
                    {readOnly ? (
                      <span>{row.value}</span>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={row.value}
                        onChange={(e) => updateRow(idx, { value: parseFloat(e.target.value) || 0 })}
                        className="lims-input"
                        style={styles.numInput}
                      />
                    )}
                  </td>

                  {/* Unit */}
                  <td style={styles.td}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>{row.unit}</span>
                  </td>

                  {/* Auto Interpretation */}
                  <td style={styles.td}>
                    <span style={{ ...styles.interpChip, ...INTERP_STYLE[interp] }}>
                      {interp}
                    </span>
                    {row.overrideInterpretation && (
                      <div style={{ fontSize: '0.65rem', color: 'gray', marginTop: '2px' }}>
                        Auto: {row.interpretation}
                      </div>
                    )}
                  </td>

                  {/* Override */}
                  <td style={styles.td}>
                    {readOnly ? (
                      <span>{row.overrideInterpretation ?? '—'}</span>
                    ) : (
                      <select
                        value={row.overrideInterpretation ?? ''}
                        onChange={(e) =>
                          updateRow(idx, {
                            overrideInterpretation: (e.target.value as any) || undefined,
                          })
                        }
                        className="lims-input"
                        style={styles.narrowSelect}
                      >
                        <option value="">No Override</option>
                        <option value="S">S — Susceptible</option>
                        <option value="I">I — Intermediate</option>
                        <option value="R">R — Resistant</option>
                      </select>
                    )}
                  </td>

                  {/* Override Reason */}
                  <td style={styles.td}>
                    {readOnly ? (
                      <span style={{ fontSize: '0.78rem' }}>{row.overrideReason ?? '—'}</span>
                    ) : (
                      <input
                        type="text"
                        value={row.overrideReason ?? ''}
                        onChange={(e) => updateRow(idx, { overrideReason: e.target.value })}
                        placeholder={row.overrideInterpretation ? 'Required…' : '—'}
                        className="lims-input"
                        style={{ ...styles.numInput, width: '140px' }}
                        disabled={!row.overrideInterpretation}
                      />
                    )}
                  </td>

                  {/* Comments */}
                  <td style={styles.td}>
                    {readOnly ? (
                      <span style={{ fontSize: '0.78rem' }}>{row.comments ?? '—'}</span>
                    ) : (
                      <input
                        type="text"
                        value={row.comments ?? ''}
                        onChange={(e) => updateRow(idx, { comments: e.target.value })}
                        placeholder="Optional..."
                        className="lims-input"
                        style={{ ...styles.numInput, width: '140px' }}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!readOnly && onSave && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <Button variant="solid" onClick={() => onSave(rows)}>
            Save Worksheet Results
          </Button>
        </div>
      )}
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { font: 'var(--type-heading-item)', margin: 0 },
  guidelinePill: {
    fontSize: '0.72rem', fontWeight: 700,
    padding: '3px 10px', borderRadius: '12px',
    backgroundColor: 'rgba(99,102,241,0.08)', color: '#6366f1',
    border: '1px solid rgba(99,102,241,0.25)',
  },
  tableWrapper: {
    overflowX: 'auto',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-xs)',
    marginTop: '8px',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' },
  th: {
    backgroundColor: 'var(--color-surface-base)',
    borderBottom: '1px solid var(--color-border-default)',
    padding: '8px 10px', textAlign: 'left',
    color: 'var(--color-text-secondary)', fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  td: { padding: '6px 10px', borderBottom: '1px solid var(--color-border-default)', verticalAlign: 'middle' },
  tr: { transition: 'background-color 0.15s' },
  interpChip: {
    display: 'inline-block',
    padding: '2px 10px', borderRadius: '12px',
    fontSize: '0.78rem',
  },
  narrowSelect: { height: '30px', fontSize: '0.78rem', padding: '0 4px', width: '120px' },
  numInput: { height: '30px', fontSize: '0.82rem', padding: '0 6px', width: '70px' },
};

export default AstWorksheet;
