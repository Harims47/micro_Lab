import React, { useState, useEffect } from 'react';
import type { AntibioticAgentResult } from '../models/types';
import { AstService } from '../services/astService';
import { AstValidator } from '../validators/astValidator';
import { useNotification } from '../../../infrastructure/notifications/useNotification';
import { useDialog } from '../../../infrastructure/dialogs/useDialog';
import { mockOrganismsCatalog } from '../../organism/api/mockOrganismServer';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { AstWorksheet } from './AstWorksheet';

// Default antibiotic agent panels
const GRAM_NEGATIVE_PANEL: AntibioticAgentResult[] = [
  { agentId: 'AMX', agentName: 'Amoxicillin',    method: 'MIC',           value: 0, unit: 'ug/mL', interpretation: 'Not Tested' },
  { agentId: 'CIP', agentName: 'Ciprofloxacin',  method: 'Disk Diffusion', value: 0, unit: 'mm',    interpretation: 'Not Tested' },
  { agentId: 'GEN', agentName: 'Gentamicin',     method: 'MIC',           value: 0, unit: 'ug/mL', interpretation: 'Not Tested' },
  { agentId: 'CRO', agentName: 'Ceftriaxone',    method: 'Disk Diffusion', value: 0, unit: 'mm',    interpretation: 'Not Tested' },
  { agentId: 'IPM', agentName: 'Imipenem',       method: 'MIC',           value: 0, unit: 'ug/mL', interpretation: 'Not Tested' },
];

const GRAM_POSITIVE_PANEL: AntibioticAgentResult[] = [
  { agentId: 'PEN', agentName: 'Penicillin',     method: 'MIC',           value: 0, unit: 'ug/mL', interpretation: 'Not Tested' },
  { agentId: 'VAN', agentName: 'Vancomycin',     method: 'MIC',           value: 0, unit: 'ug/mL', interpretation: 'Not Tested' },
  { agentId: 'ERY', agentName: 'Erythromycin',   method: 'Disk Diffusion', value: 0, unit: 'mm',    interpretation: 'Not Tested' },
  { agentId: 'CLI', agentName: 'Clindamycin',    method: 'Disk Diffusion', value: 0, unit: 'mm',    interpretation: 'Not Tested' },
  { agentId: 'LZD', agentName: 'Linezolid',      method: 'MIC',           value: 0, unit: 'ug/mL', interpretation: 'Not Tested' },
];

interface AstWizardProps {
  onClose: () => void;
}

export const AstWizard: React.FC<AstWizardProps> = ({ onClose }) => {
  const { addToast } = useNotification();
  const { confirmDelete } = useDialog();

  const [step, setStep] = useState(1);
  const [dirty, setDirty] = useState(false);

  // Step 1 selections
  const [colonyId, setColonyId] = useState('');
  const [selectedOrganism, setSelectedOrganism] = useState(mockOrganismsCatalog[0]);
  const [guideline, setGuideline] = useState<'CLSI 2026' | 'EUCAST 2026'>('CLSI 2026');

  // Step 2 worksheet
  const [agents, setAgents] = useState<AntibioticAgentResult[]>(GRAM_NEGATIVE_PANEL);
  const [createdAstId, setCreatedAstId] = useState<string | null>(null);

  // Auto-select panel based on gram classification
  useEffect(() => {
    const isPos = selectedOrganism.gramClassification === 'Gram Positive';
    setAgents(isPos ? GRAM_POSITIVE_PANEL.map(a => ({ ...a })) : GRAM_NEGATIVE_PANEL.map(a => ({ ...a })));
  }, [selectedOrganism]);

  const handleCancel = async () => {
    if (dirty) {
      const confirm = await confirmDelete({ title: 'Discard AST', message: 'Discard this AST worksheet?' });
      if (!confirm) return;
    }
    onClose();
  };

  const handleProceedToWorksheet = async () => {
    if (!colonyId.trim()) {
      addToast('error', 'Colony ID is required.');
      return;
    }
    try {
      const created = await AstService.createAstRecord({
        colonyId,
        organismId: selectedOrganism.organismId,
        organismName: `${selectedOrganism.genus} ${selectedOrganism.species}`,
        guideline,
      });
      setCreatedAstId(created.astId);
      setDirty(true);
      setStep(2);
    } catch {
      addToast('error', 'Failed to create AST record.');
    }
  };

  const handleSaveWorksheet = async (results: AntibioticAgentResult[]) => {
    if (!createdAstId) return;

    const validation = AstValidator.validate({
      colonyId,
      organismId: selectedOrganism.organismId,
      organismName: `${selectedOrganism.genus} ${selectedOrganism.species}`,
      guideline,
      agentResults: results,
    });

    if (!validation.isValid) {
      addToast('error', validation.error ?? 'Validation failed.');
      return;
    }

    try {
      await AstService.saveAstResult(createdAstId, results, guideline);
      addToast('success', 'AST worksheet saved. Pending technical review.');
      onClose();
    } catch {
      addToast('error', 'Failed to save AST worksheet results.');
    }
  };

  const STEPS = ['Colony & Organism', 'Result Entry & Interpretation'];

  return (
    <Card style={styles.container}>
      {/* Stepper Header */}
      <div style={styles.stepper}>
        {STEPS.map((label, i) => {
          const s = i + 1;
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                ...styles.stepDot,
                backgroundColor: step === s ? 'var(--color-brand-primary)' : step > s ? 'var(--color-status-success)' : 'var(--color-surface-base)',
                color: step >= s ? 'white' : 'var(--color-text-secondary)',
                borderColor: step >= s ? 'var(--color-brand-primary)' : 'var(--color-border-default)',
              }}>
                {step > s ? '✓' : s}
              </span>
              <span style={{ font: 'var(--type-label-default)', color: step === s ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                {label}
              </span>
              {s < STEPS.length && <span style={styles.stepLine} />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Colony & Organism */}
      {step === 1 && (
        <Card style={{ padding: 'var(--spacing-md)' }}>
          <div style={styles.formGrid}>
            <div>
              <label className="lims-form-label" style={styles.label}>Colony ID</label>
              <input
                type="text"
                value={colonyId}
                onChange={(e) => setColonyId(e.target.value)}
                placeholder="e.g. COL-ID-000001"
                className="lims-input"
                style={{ width: '100%', height: '36px' }}
              />
            </div>

            <div>
              <label className="lims-form-label" style={styles.label}>Organism</label>
              <select
                value={selectedOrganism.organismId}
                onChange={(e) => {
                  const org = mockOrganismsCatalog.find(o => o.organismId === e.target.value);
                  if (org) setSelectedOrganism(org);
                }}
                className="lims-input"
                style={{ width: '100%', height: '36px' }}
              >
                {mockOrganismsCatalog.map((o) => (
                  <option key={o.organismId} value={o.organismId}>
                    {o.genus} {o.species} ({o.gramClassification})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="lims-form-label" style={styles.label}>Interpretation Guideline</label>
              <select
                value={guideline}
                onChange={(e) => setGuideline(e.target.value as any)}
                className="lims-input"
                style={{ width: '100%', height: '36px' }}
              >
                <option value="CLSI 2026">CLSI 2026</option>
                <option value="EUCAST 2026">EUCAST 2026</option>
              </select>
            </div>

            <div>
              <label className="lims-form-label" style={styles.label}>Auto-selected Panel</label>
              <div style={styles.panelPill}>
                {selectedOrganism.gramClassification === 'Gram Positive'
                  ? 'Gram-Positive GPC Panel (PEN, VAN, ERY, CLI, LZD)'
                  : 'Gram-Negative Enteric Panel (AMX, CIP, GEN, CRO, IPM)'}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Worksheet */}
      {step === 2 && (
        <AstWorksheet
          agents={agents}
          guideline={guideline}
          onSave={handleSaveWorksheet}
        />
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
        <div style={{ display: 'flex', gap: '8px' }}>
          {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
          {step === 1 && (
            <Button variant="solid" onClick={handleProceedToWorksheet}>
              Proceed to Worksheet
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 'var(--spacing-lg)',
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)',
    boxSizing: 'border-box',
  },
  stepper: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)',
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: 'var(--spacing-sm)', flexWrap: 'wrap',
  },
  stepDot: {
    width: '28px', height: '28px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '2px solid', fontSize: '0.85rem', fontWeight: 'bold',
  },
  stepLine: { width: '40px', height: '2px', backgroundColor: 'var(--color-border-default)' },
  formGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: 'var(--spacing-md)',
  },
  label: { display: 'block', marginBottom: '6px' },
  panelPill: {
    padding: '8px 12px', borderRadius: '4px',
    backgroundColor: 'var(--color-surface-base)',
    border: '1px solid var(--color-border-default)',
    fontSize: '0.82rem', color: 'var(--color-text-secondary)',
  },
  footer: {
    display: 'flex', justifyContent: 'space-between',
    borderTop: '1px solid var(--color-border-default)',
    paddingTop: 'var(--spacing-md)',
  },
};

export default AstWizard;
