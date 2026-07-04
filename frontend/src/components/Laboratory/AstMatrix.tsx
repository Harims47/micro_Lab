import React from 'react';
import './Laboratory.css';
import type { ASTResult } from '../../types';

export interface AstMatrixProps {
  results: ASTResult[];
  className?: string;
}

export const AstMatrix: React.FC<AstMatrixProps> = ({
  results,
  className = ''
}) => {
  return (
    <div style={{ overflowX: 'auto', width: '100%' }} className={className}>
      <table className="lims-ast-matrix-table">
        <thead>
          <tr>
            <th className="lims-ast-matrix-th">Antibiotic</th>
            <th className="lims-ast-matrix-th">Code</th>
            <th className="lims-ast-matrix-th">Method</th>
            <th className="lims-ast-matrix-th">Zone (mm)</th>
            <th className="lims-ast-matrix-th">MIC (mcg/mL)</th>
            <th className="lims-ast-matrix-th">Interpretation</th>
          </tr>
        </thead>
        <tbody>
          {results.length === 0 ? (
            <tr>
              <td colSpan={6} className="lims-ast-matrix-td" style={{ color: 'var(--color-text-secondary)' }}>
                No AST susceptibility data recorded.
              </td>
            </tr>
          ) : (
            results.map((ast) => (
              <tr key={ast.astId}>
                <td className="lims-ast-matrix-td" style={{ fontWeight: 600, textAlign: 'left' }}>{ast.antibioticName}</td>
                <td className="lims-ast-matrix-td" style={{ fontFamily: 'var(--font-mono)' }}>{ast.antibioticCode}</td>
                <td className="lims-ast-matrix-td">{ast.method}</td>
                <td className="lims-ast-matrix-td">{ast.zoneDiameter !== undefined ? `${ast.zoneDiameter} mm` : 'N/A'}</td>
                <td className="lims-ast-matrix-td">{ast.micValue !== undefined ? `${ast.micValue} mcg/mL` : 'N/A'}</td>
                <td className={`lims-ast-matrix-td ast-interpretation-${ast.interpretation}`}>
                  {ast.interpretation === 'S' && 'Susceptible (S)'}
                  {ast.interpretation === 'I' && 'Intermediate (I)'}
                  {ast.interpretation === 'R' && 'Resistant (R)'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
