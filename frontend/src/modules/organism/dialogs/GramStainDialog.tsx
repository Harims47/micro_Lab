import React, { useState } from 'react';
import type { GramStain } from '../models/types';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';

interface GramStainDialogProps {
  onClose: () => void;
  onSubmit: (gram: GramStain) => void;
}

export const GramStainDialog: React.FC<GramStainDialogProps> = ({ onClose, onSubmit }) => {
  const [reaction, setReaction] = useState<GramStain['reaction']>('Gram Positive');
  const [shape, setShape] = useState<GramStain['shape']>('Cocci');
  const [arrangement, setArrangement] = useState<GramStain['arrangement']>('Singles');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      reaction,
      shape,
      arrangement,
      technician: 'Sarah Connor',
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div style={styles.overlay}>
      <Card style={styles.modal}>
        <h3 style={styles.title}>Document Gram Stain Reaction</h3>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label className="lims-form-label" style={{ display: 'block', marginBottom: '6px' }}>Reaction</label>
            <select
              value={reaction}
              onChange={(e) => setReaction(e.target.value as any)}
              className="lims-input"
              style={{ width: '100%', height: '36px' }}
            >
              <option value="Gram Positive">Gram Positive (Purple)</option>
              <option value="Gram Negative">Gram Negative (Pink)</option>
              <option value="Gram Variable">Gram Variable</option>
              <option value="Not Applicable">Not Applicable</option>
            </select>
          </div>

          <div>
            <label className="lims-form-label" style={{ display: 'block', marginBottom: '6px' }}>Cellular Shape</label>
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value as any)}
              className="lims-input"
              style={{ width: '100%', height: '36px' }}
            >
              <option value="Cocci">Cocci (Spherical)</option>
              <option value="Bacilli">Bacilli (Rods)</option>
              <option value="Coccobacilli">Coccobacilli</option>
              <option value="Spirilla">Spirilla (Spiral)</option>
              <option value="Pleomorphic">Pleomorphic</option>
            </select>
          </div>

          <div>
            <label className="lims-form-label" style={{ display: 'block', marginBottom: '6px' }}>Arrangement Pattern</label>
            <select
              value={arrangement}
              onChange={(e) => setArrangement(e.target.value as any)}
              className="lims-input"
              style={{ width: '100%', height: '36px' }}
            >
              <option value="Singles">Singles</option>
              <option value="Pairs">Pairs (Diplo)</option>
              <option value="Chains">Chains (Strepto)</option>
              <option value="Clusters">Clusters (Staphylo)</option>
              <option value="Tetrads">Tetrads</option>
              <option value="Palisades">Palisades</option>
            </select>
          </div>

          <div style={styles.actions}>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="solid" type="submit">
              Save Stain Reaction
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
  },
  modal: {
    width: '400px',
    padding: 'var(--spacing-lg)',
    boxShadow: 'var(--elevation-3)',
  },
  title: {
    font: 'var(--type-heading-subsection)',
    margin: '0 0 var(--spacing-md) 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    borderTop: '1px solid var(--color-border-default)',
    paddingTop: 'var(--spacing-md)',
    marginTop: '12px',
  },
};
export default GramStainDialog;
