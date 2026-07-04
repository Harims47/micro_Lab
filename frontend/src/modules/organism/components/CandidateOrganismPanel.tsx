import React, { useState, useMemo } from 'react';
import type { IdentificationInstrument } from '../models/types';
import { mockOrganismsCatalog, mockInstruments } from '../api/mockOrganismServer';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';

interface CandidateOrganismPanelProps {
  gramReaction?: string;
  gramShape?: string;
  biochemicals?: { testName: string; result: string }[];
  onSelectCandidate: (candidate: {
    organismId: string;
    organismName: string;
    method: string;
    confidenceScore: number;
    instrument: IdentificationInstrument;
  }) => void;
}

export const CandidateOrganismPanel: React.FC<CandidateOrganismPanelProps> = ({
  gramReaction,
  gramShape,
  biochemicals = [],
  onSelectCandidate,
}) => {
  const [method, setMethod] = useState<'MALDI-TOF' | 'VITEK 2' | 'Manual'>('MALDI-TOF');
  const [selectedInstrument, setSelectedInstrument] = useState<IdentificationInstrument>(mockInstruments[0]);

  // Search candidate matches based on Gram & Shape morphology match
  const candidates = useMemo(() => {
    return mockOrganismsCatalog.map((org) => {
      let score = 50.0; // Base baseline match percentage

      // Morphological reaction matches
      if (gramReaction && org.gramClassification === gramReaction) {
        score += 25.0;
      }
      if (gramShape && org.shape.toLowerCase() === gramShape.toLowerCase()) {
        score += 15.0;
      }

      // Biochemical assay matches ( Catalase +/- etc. )
      biochemicals.forEach((t) => {
        if (t.testName === 'Catalase' && org.genus === 'Staphylococcus' && t.result === 'Positive') {
          score += 10.0;
        }
        if (t.testName === 'Oxidase' && org.genus === 'Pseudomonas' && t.result === 'Positive') {
          score += 10.0;
        }
      });

      return {
        ...org,
        matchScore: Math.min(score, 99.9),
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [gramReaction, gramShape, biochemicals]);

  return (
    <Card style={styles.container}>
      <h4 style={styles.title}>Taxonomic Database Candidates Match</h4>

      {/* Select analyzer hardware */}
      <div style={styles.controls}>
        <div>
          <label className="lims-form-label" style={{ display: 'block', marginBottom: '4px' }}>Instrument Method</label>
          <select
            value={method}
            onChange={(e) => {
              const val = e.target.value as any;
              setMethod(val);
              setSelectedInstrument(val === 'VITEK 2' ? mockInstruments[1] : mockInstruments[0]);
            }}
            className="lims-input"
            style={{ height: '34px', width: '200px' }}
          >
            <option value="MALDI-TOF">MALDI-TOF Mass Spec</option>
            <option value="VITEK 2">Vitek-2 Phenotypic Reader</option>
            <option value="Manual">Manual Identification</option>
          </select>
        </div>

        <div>
          <label className="lims-form-label" style={{ display: 'block', marginBottom: '4px' }}>Selected Instrument</label>
          <span style={styles.instrumentText}>
            {selectedInstrument.vendor} {selectedInstrument.model} (S/N: {selectedInstrument.serialNumber})
          </span>
        </div>
      </div>

      {/* Candidates List */}
      <div style={styles.list}>
        {candidates.map((c) => (
          <div key={c.organismId} style={styles.item}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <strong style={{ fontSize: '1rem', color: 'var(--color-brand-primary)' }}>
                  {c.genus} {c.species}
                </strong>
                <span style={styles.scoreBadge}>{c.matchScore.toFixed(1)}% Match</span>
              </div>
              <p style={styles.sub}>
                Taxonomy ID: {c.taxonomyVersion} | Gram: {c.gramClassification} | Respiration: {c.respiration}
              </p>
              {c.clinicalNotes && <p style={styles.notes}>{c.clinicalNotes}</p>}
            </div>

            <Button
              variant="outline"
              onClick={() =>
                onSelectCandidate({
                  organismId: c.organismId,
                  organismName: `${c.genus} ${c.species}`,
                  method: method === 'MALDI-TOF' ? 'MALDI-TOF Mass Spectrometry' : method === 'VITEK 2' ? 'Automated Phenotypic (Vitek-2)' : 'Manual Phenotypic',
                  confidenceScore: c.matchScore,
                  instrument: selectedInstrument,
                })
              }
            >
              Select Candidate
            </Button>
          </div>
        ))}
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
  title: {
    font: 'var(--type-heading-item)',
    margin: 0,
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: '4px',
  },
  controls: {
    display: 'flex',
    gap: 'var(--spacing-md)',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  instrumentText: {
    display: 'inline-block',
    padding: '6px 12px',
    backgroundColor: 'var(--color-surface-base)',
    border: '1px solid var(--color-border-default)',
    borderRadius: '4px',
    fontSize: '0.85rem',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '10px',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: 'var(--color-surface-base)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-sm)',
    gap: '12px',
  },
  scoreBadge: {
    backgroundColor: 'var(--color-status-success-bg)',
    color: 'var(--color-status-success)',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
  },
  sub: {
    margin: '4px 0 0 0',
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary)',
  },
  notes: {
    margin: '6px 0 0 0',
    fontSize: '0.8rem',
    fontStyle: 'italic',
    color: 'var(--color-text-primary)',
  },
};
export default CandidateOrganismPanel;
