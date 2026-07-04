import React, { useState } from 'react';
import type { ColonyItem, PlateObservation } from '../models/types';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { TextInput } from '../../../components/Form/TextInput';

interface CultureObservationDialogProps {
  onClose: () => void;
  onSubmit: (observation: Partial<PlateObservation>, colonies: Partial<ColonyItem>[]) => void;
}

export const CultureObservationDialog: React.FC<CultureObservationDialogProps> = ({
  onClose,
  onSubmit,
}) => {
  const [growthLevel, setGrowthLevel] = useState<PlateObservation['growthLevel']>('No Growth');
  const [comments, setComments] = useState('');

  // Colonies list setup
  const [colonies, setColonies] = useState<Partial<ColonyItem>[]>([]);

  const handleAddColony = () => {
    setColonies([
      ...colonies,
      {
        morphology: 'Circular, smooth',
        color: 'White',
        hemolysis: 'None',
        odor: 'None',
        texture: 'Moist',
      },
    ]);
  };

  const handleRemoveColony = (idx: number) => {
    setColonies(colonies.filter((_, i) => i !== idx));
  };

  const handleColonyChange = (idx: number, field: keyof ColonyItem, value: any) => {
    const updated = [...colonies];
    updated[idx] = {
      ...updated[idx],
      [field]: value,
    };
    setColonies(updated);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(
      {
        growthLevel,
        comments,
      },
      colonies
    );
  };

  return (
    <div style={styles.overlay}>
      <Card style={styles.modal}>
        <h3 style={styles.title}>Record Growth Observation</h3>

        <form onSubmit={handleFormSubmit} style={styles.form}>
          <div style={styles.grid}>
            <div>
              <label className="lims-form-label" style={{ display: 'block', marginBottom: '6px' }}>Growth Severity Level</label>
              <select
                value={growthLevel}
                onChange={(e) => setGrowthLevel(e.target.value as any)}
                className="lims-input"
                style={{ width: '100%', height: '36px' }}
              >
                <option value="No Growth">No Growth</option>
                <option value="Scant">Scant</option>
                <option value="Light">Light</option>
                <option value="Moderate">Moderate</option>
                <option value="Heavy">Heavy</option>
                <option value="Mixed growth">Mixed growth</option>
                <option value="Swarming">Swarming</option>
                <option value="Confluent">Confluent</option>
                <option value="Isolated colonies">Isolated colonies</option>
                <option value="No significant growth">No significant growth</option>
              </select>
            </div>
            <div>
              <TextInput
                label="Observation Remarks"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="e.g. Medium colony growth after 24h incubation."
              />
            </div>
          </div>

          {/* Isolate Colonies Section */}
          {growthLevel !== 'No Growth' && growthLevel !== 'No significant growth' && (
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ fontSize: '0.85rem' }}>Isolate Colony Profiles</strong>
                <Button variant="outline" type="button" onClick={handleAddColony}>
                  Isolate Colony
                </Button>
              </div>

              <div style={styles.coloniesList}>
                {colonies.length === 0 ? (
                  <p style={{ margin: 0, font: 'var(--type-body-small)', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                    Click Isolate Colony to document isolated bacterial colony parameters for Sprint 9 Organism ID.
                  </p>
                ) : (
                  colonies.map((col, idx) => (
                    <div key={idx} style={styles.colonyRow}>
                      <div style={{ flex: 2 }}>
                        <TextInput
                          label="Morphology"
                          value={col.morphology || ''}
                          onChange={(e) => handleColonyChange(idx, 'morphology', e.target.value)}
                        />
                      </div>
                      <div style={{ flex: 1.5 }}>
                        <TextInput
                          label="Colony Color"
                          value={col.color || ''}
                          onChange={(e) => handleColonyChange(idx, 'color', e.target.value)}
                        />
                      </div>
                      <div style={{ flex: 1.5 }}>
                        <label className="lims-form-label" style={{ display: 'block', marginBottom: '6px' }}>Hemolysis</label>
                        <select
                          value={col.hemolysis}
                          onChange={(e) => handleColonyChange(idx, 'hemolysis', e.target.value)}
                          className="lims-input"
                          style={{ width: '100%', height: '36px' }}
                        >
                          <option value="None">None</option>
                          <option value="Alpha">Alpha</option>
                          <option value="Beta">Beta</option>
                          <option value="Gamma">Gamma</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => handleRemoveColony(idx)}
                          style={{ color: 'var(--color-status-danger)', marginTop: '22px' }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div style={styles.actions}>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="solid" type="submit">
              Save Observation
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
    width: '600px',
    maxWidth: '90%',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  coloniesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: 'var(--color-surface-base)',
    padding: 'var(--spacing-md)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-sm)',
    maxHeight: '180px',
    overflowY: 'auto',
  },
  colonyRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
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
export default CultureObservationDialog;
