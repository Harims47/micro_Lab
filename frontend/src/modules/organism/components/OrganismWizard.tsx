import React, { useState } from 'react';
import type { Colony, GramStain, BiochemicalResult, IdentificationInstrument } from '../models/types';
import { OrganismService } from '../services/organismService';
import { useNotification } from '../../../infrastructure/notifications/useNotification';
import { useDialog } from '../../../infrastructure/dialogs/useDialog';

import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { ColonySelectionPanel } from './ColonySelectionPanel';
import { GramStainDialog } from '../dialogs/GramStainDialog';
import { BiochemicalPanel } from './BiochemicalPanel';
import { CandidateOrganismPanel } from './CandidateOrganismPanel';

interface OrganismWizardProps {
  onClose: () => void;
}

export const OrganismWizard: React.FC<OrganismWizardProps> = ({ onClose }) => {
  const { addToast } = useNotification();
  const { confirmDelete } = useDialog();

  const [step, setStep] = useState(1);
  const [dirty, setDirty] = useState(false);

  // Wizard data collection
  const [selectedColony, setSelectedColony] = useState<Colony | null>(null);
  
  // Gram stain reaction
  const [gramStain, setGramStain] = useState<GramStain | null>(null);
  const [gramOpen, setGramOpen] = useState(false);

  // Biochemical assays
  const [biochemicals, setBiochemicals] = useState<BiochemicalResult[]>([]);

  // Selected candidate result
  const [selectedCandidate, setSelectedCandidate] = useState<{
    organismId: string;
    organismName: string;
    method: string;
    confidenceScore: number;
    instrument: IdentificationInstrument;
  } | null>(null);

  const handleCancel = async () => {
    if (dirty) {
      const confirm = await confirmDelete({
        title: 'Discard Progress',
        message: 'Are you sure you want to discard identification progress?',
      });
      if (!confirm) return;
    }
    onClose();
  };

  const handleSelectColony = (col: Colony) => {
    setSelectedColony(col);
    setGramStain(col.gramStain || null);
    setBiochemicals(col.biochemicals || []);
    setStep(2);
    setDirty(true);
  };

  const handleSaveGram = (gram: GramStain) => {
    setGramStain(gram);
    setGramOpen(false);
    addToast('success', 'Gram stain reaction documented.');
  };

  const handleSaveBiochemicals = (tests: BiochemicalResult[]) => {
    setBiochemicals(tests);
    addToast('success', 'Biochemical assays saved.');
    setStep(3);
  };

  const handleSelectCandidate = (candidate: any) => {
    setSelectedCandidate(candidate);
    setStep(4);
  };

  const handleComplete = async () => {
    if (!selectedColony || !selectedCandidate) return;

    try {
      // 1. Save Gram Stain if changed/new
      if (gramStain) {
        await OrganismService.saveGramStain(selectedColony.colonyId, gramStain);
      }
      
      // 2. Save Biochemicals
      if (biochemicals.length > 0) {
        await OrganismService.saveBiochemicals(selectedColony.colonyId, biochemicals);
      }

      // 3. Create Attempt
      await OrganismService.createAttempt(selectedColony.colonyId, {
        organismId: selectedCandidate.organismId,
        organismName: selectedCandidate.organismName,
        method: selectedCandidate.method as any,
        confidence: {
          instrumentConfidence: selectedCandidate.confidenceScore,
          technicianConfidence: 'High',
          supervisorConfidence: 'High',
          finalConfidence: 'High'
        },
        instrument: selectedCandidate.instrument
      });

      addToast('success', 'Organism identification candidate generated successfully.');
      onClose();
    } catch {
      addToast('error', 'Failed to save colony identification.');
    }
  };

  return (
    <Card style={styles.container}>
      {/* Stepper Header */}
      <div style={styles.stepper}>
        {[1, 2, 3, 4].map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                ...styles.stepDot,
                backgroundColor: step === s ? 'var(--color-brand-primary)' : step > s ? 'var(--color-status-success)' : 'var(--color-surface-base)',
                color: step >= s ? 'white' : 'var(--color-text-secondary)',
                borderColor: step >= s ? 'var(--color-brand-primary)' : 'var(--color-border-default)',
              }}
            >
              {step > s ? '✓' : s}
            </span>
            <span style={{ font: 'var(--type-label-default)', color: step === s ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
              {s === 1 ? 'Colony Selection' : s === 2 ? 'Reactions & Biochemicals' : s === 3 ? 'Taxon Candidates' : 'Confirm ID'}
            </span>
            {s < 4 && <span style={styles.stepLine} />}
          </div>
        ))}
      </div>

      {/* Step Body Switcher */}
      <div style={styles.body}>
        {step === 1 && (
          <ColonySelectionPanel onSelectColony={handleSelectColony} />
        )}

        {step === 2 && selectedColony && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {/* Gram stain card */}
            <Card style={{ padding: 'var(--spacing-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>Gram Stain morphology</h4>
                <Button variant="outline" onClick={() => setGramOpen(true)}>
                  {gramStain ? 'Edit Stain Result' : 'Document Stain Result'}
                </Button>
              </div>

              {gramStain ? (
                <div style={{ marginTop: '12px', fontSize: '0.85rem' }}>
                  Reaction: <strong style={{ color: 'purple' }}>{gramStain.reaction}</strong> | Shape: <strong>{gramStain.shape}</strong> | Arrangement: <strong>{gramStain.arrangement}</strong>
                </div>
              ) : (
                <p style={{ margin: '12px 0 0 0', fontStyle: 'italic', fontSize: '0.8rem', color: 'gray' }}>
                  No Gram stain reaction recorded yet. Required for candidate matching algorithms.
                </p>
              )}
            </Card>

            {/* Biochemical panel */}
            <BiochemicalPanel
              initialTests={biochemicals}
              onSave={handleSaveBiochemicals}
            />
          </div>
        )}

        {step === 3 && selectedColony && (
          <CandidateOrganismPanel
            gramReaction={gramStain?.reaction}
            gramShape={gramStain?.shape}
            biochemicals={biochemicals}
            onSelectCandidate={handleSelectCandidate}
          />
        )}

        {step === 4 && selectedColony && selectedCandidate && (
          <Card style={{ padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: 0 }}>Confirm Organism Candidate Identification</h3>
            <p>You are about to register a clinical identification candidate result:</p>

            <div style={styles.summaryBox}>
              <p>Colony: <strong>{selectedColony.colonyId}</strong></p>
              <p>Target Organism Match: <strong style={{ fontSize: '1.1rem', color: 'var(--color-brand-primary)' }}>{selectedCandidate.organismName}</strong></p>
              <p>Identification Method: <strong>{selectedCandidate.method}</strong></p>
              <p>Match Confidence Level: <strong>{selectedCandidate.confidenceScore.toFixed(1)}%</strong></p>
              <p>Analyzer Instrument: <strong>{selectedCandidate.instrument.vendor} {selectedCandidate.instrument.model}</strong></p>
            </div>
          </Card>
        )}
      </div>

      {/* Footer controls */}
      <div style={styles.footer}>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <div style={{ display: 'flex', gap: '8px' }}>
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step === 4 && (
            <Button variant="solid" onClick={handleComplete}>
              Register Identification
            </Button>
          )}
        </div>
      </div>

      {/* Gram stain dialogue */}
      {gramOpen && (
        <GramStainDialog
          onClose={() => setGramOpen(false)}
          onSubmit={handleSaveGram}
        />
      )}
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 'var(--spacing-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
    boxSizing: 'border-box',
  },
  stepper: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)',
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: 'var(--spacing-sm)',
    flexWrap: 'wrap',
  },
  stepDot: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid',
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
  stepLine: {
    width: '40px',
    height: '2px',
    backgroundColor: 'var(--color-border-default)',
  },
  body: {
    minHeight: '260px',
    flexGrow: 1,
  },
  summaryBox: {
    backgroundColor: 'var(--color-surface-base)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '0.85rem',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid var(--color-border-default)',
    paddingTop: 'var(--spacing-md)',
  },
};
export default OrganismWizard;
