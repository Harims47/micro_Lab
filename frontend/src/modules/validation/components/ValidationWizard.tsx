import React, { useState } from 'react';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { useNotification } from '../../../infrastructure/notifications/useNotification';

// The wizard guides the user through selecting an AST record and initiating validation.
// In mock-only mode, we use sample AST IDs from the seeded AST database.

const MOCK_APPROVED_ASTS = [
  { astId: 'AST-ID-000016', organism: 'Escherichia coli',          colony: 'COL-ID-000016', patient: 'Patient Q 116' },
  { astId: 'AST-ID-000017', organism: 'Staphylococcus aureus',     colony: 'COL-ID-000017', patient: 'Patient R 117' },
  { astId: 'AST-ID-000018', organism: 'Pseudomonas aeruginosa',    colony: 'COL-ID-000018', patient: 'Patient S 118' },
  { astId: 'AST-ID-000019', organism: 'Klebsiella pneumoniae',     colony: 'COL-ID-000019', patient: 'Patient T 119' },
  { astId: 'AST-ID-000020', organism: 'Enterococcus faecalis',     colony: 'COL-ID-000020', patient: 'Patient U 120' },
];

const REVIEWERS = [
  { value: 'dr_chen',          label: 'Dr. Chen — Clinical Microbiologist' },
  { value: 'dr_patel',         label: 'Dr. Patel — Pathologist' },
  { value: 'supervisor_user',  label: 'Supervisor — Dr. Smith' },
  { value: 'dr_kim',           label: 'Dr. Kim — Lab Director' },
  { value: 'pathologist_user', label: 'Dr. Rodriguez — Pathologist' },
];

interface WizardProps {
  onClose: () => void;
}

export const ValidationWizard: React.FC<WizardProps> = ({ onClose }) => {
  const { addToast } = useNotification();
  const [step, setStep] = useState(1);

  // Step 1
  const [selectedAstId, setSelectedAstId] = useState(MOCK_APPROVED_ASTS[0].astId);
  const [priority, setPriority] = useState<'Routine' | 'Urgent' | 'Stat'>('Routine');

  // Step 2 – Technical
  const [techReviewer, setTechReviewer] = useState(REVIEWERS[0].value);
  const [techDue, setTechDue] = useState('');

  // Step 3 – Clinical
  const [clinicalReviewer, setClinicalReviewer] = useState(REVIEWERS[1].value);

  // Step 4 – Pathologist
  const [pathReviewer, setPathReviewer] = useState(REVIEWERS[1].value);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAst = MOCK_APPROVED_ASTS.find((a) => a.astId === selectedAstId)!;

  const STEPS = ['Case Selection', 'Technical Review', 'Clinical Review', 'Summary'];

  const handleSubmit = async () => {
    if (techReviewer === 'tech_user') {
      addToast('error', 'Technical reviewer cannot be the test performer (segregation of duties).');
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    addToast('success', `Validation case initiated for ${selectedAst.organism}. Case assigned to reviewers.`);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Card style={styles.container}>
      {/* Stepper */}
      <div style={styles.stepper}>
        {STEPS.map((label, i) => {
          const s = i + 1;
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                ...styles.dot,
                backgroundColor: step === s ? 'var(--color-brand-primary)' : step > s ? 'var(--color-status-success)' : 'var(--color-surface-base)',
                color: step >= s ? 'white' : 'var(--color-text-secondary)',
                borderColor: step >= s ? 'var(--color-brand-primary)' : 'var(--color-border-default)',
              }}>
                {step > s ? '✓' : s}
              </span>
              <span style={{ font: 'var(--type-label-default)', color: step === s ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                {label}
              </span>
              {s < STEPS.length && <span style={styles.line} />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Case Selection */}
      {step === 1 && (
        <Card style={styles.stepBody}>
          <h4 style={styles.stepTitle}>Select Approved AST Case</h4>
          <div style={styles.formGrid}>
            <div>
              <label className="lims-form-label" style={styles.label}>Approved AST Record</label>
              <select value={selectedAstId} onChange={(e) => setSelectedAstId(e.target.value)} className="lims-input" style={{ width: '100%', height: '36px' }}>
                {MOCK_APPROVED_ASTS.map((a) => (
                  <option key={a.astId} value={a.astId}>{a.astId} — {a.organism}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="lims-form-label" style={styles.label}>Patient</label>
              <div style={styles.readonlyPill}>{selectedAst.patient}</div>
            </div>
            <div>
              <label className="lims-form-label" style={styles.label}>Organism</label>
              <div style={styles.readonlyPill}><strong>{selectedAst.organism}</strong></div>
            </div>
            <div>
              <label className="lims-form-label" style={styles.label}>Validation Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="lims-input" style={{ width: '100%', height: '36px' }}>
                <option value="Routine">Routine</option>
                <option value="Urgent">Urgent</option>
                <option value="Stat">STAT</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Technical Review Assignment */}
      {step === 2 && (
        <Card style={styles.stepBody}>
          <h4 style={styles.stepTitle}>Technical & QC Reviewer Assignment</h4>
          <div style={styles.formGrid}>
            <div>
              <label className="lims-form-label" style={styles.label}>Technical Validation Reviewer</label>
              <select value={techReviewer} onChange={(e) => setTechReviewer(e.target.value)} className="lims-input" style={{ width: '100%', height: '36px' }}>
                {REVIEWERS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="lims-form-label" style={styles.label}>Due Date (optional)</label>
              <input type="date" value={techDue} onChange={(e) => setTechDue(e.target.value)} className="lims-input" style={{ width: '100%', height: '36px' }} />
            </div>
          </div>
          <div style={{ marginTop: '8px', padding: '10px', borderRadius: '6px', backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.8rem' }}>
            ⚠ Reviewer must not be the original AST testing performer (segregation of duties enforced).
          </div>
        </Card>
      )}

      {/* Step 3: Clinical Review */}
      {step === 3 && (
        <Card style={styles.stepBody}>
          <h4 style={styles.stepTitle}>Clinical & Pathologist Reviewer Assignment</h4>
          <div style={styles.formGrid}>
            <div>
              <label className="lims-form-label" style={styles.label}>Clinical Microbiologist</label>
              <select value={clinicalReviewer} onChange={(e) => setClinicalReviewer(e.target.value)} className="lims-input" style={{ width: '100%', height: '36px' }}>
                {REVIEWERS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="lims-form-label" style={styles.label}>Pathologist</label>
              <select value={pathReviewer} onChange={(e) => setPathReviewer(e.target.value)} className="lims-input" style={{ width: '100%', height: '36px' }}>
                {REVIEWERS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Step 4: Summary */}
      {step === 4 && (
        <Card style={styles.stepBody}>
          <h4 style={styles.stepTitle}>Validation Case Summary</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              ['AST Record', selectedAstId],
              ['Organism', selectedAst.organism],
              ['Patient', selectedAst.patient],
              ['Priority', priority],
              ['Technical Reviewer', REVIEWERS.find(r => r.value === techReviewer)?.label ?? techReviewer],
              ['Clinical Reviewer', REVIEWERS.find(r => r.value === clinicalReviewer)?.label ?? clinicalReviewer],
              ['Pathologist', REVIEWERS.find(r => r.value === pathReviewer)?.label ?? pathReviewer],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid var(--color-border-default)', paddingBottom: '6px' }}>
                <span style={{ width: '180px', color: 'var(--color-text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>{label}</span>
                <span style={{ fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <div style={{ display: 'flex', gap: '8px' }}>
          {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
          {step < STEPS.length && <Button variant="solid" onClick={() => setStep(step + 1)}>Continue</Button>}
          {step === STEPS.length && (
            <Button variant="solid" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Initiating...' : 'Initiate Validation'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' },
  stepper: { display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-sm)', flexWrap: 'wrap' },
  dot: { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid', fontSize: '0.85rem', fontWeight: 'bold' },
  line: { width: '40px', height: '2px', backgroundColor: 'var(--color-border-default)' },
  stepBody: { padding: 'var(--spacing-md)' },
  stepTitle: { font: 'var(--type-heading-item)', margin: '0 0 var(--spacing-md) 0' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' },
  label: { display: 'block', marginBottom: '6px' },
  readonlyPill: { padding: '8px 12px', borderRadius: '4px', backgroundColor: 'var(--color-surface-base)', border: '1px solid var(--color-border-default)', fontSize: '0.82rem' },
  footer: { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border-default)', paddingTop: 'var(--spacing-md)' },
};

export default ValidationWizard;
