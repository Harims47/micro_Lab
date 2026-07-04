import React, { useState, useEffect } from 'react';
import type { Colony } from '../models/types';
import { OrganismService } from '../services/organismService';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';

interface ColonySelectionPanelProps {
  onSelectColony: (colony: Colony) => void;
}

export const ColonySelectionPanel: React.FC<ColonySelectionPanelProps> = ({ onSelectColony }) => {
  const [colonies, setColonies] = useState<Colony[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await OrganismService.getColonies({ limit: 100 });
        // Find colonies that need identification
        const pending = res.colonies.filter((c) => ['Observed', 'Selected', 'Under Identification'].includes(c.status));
        setColonies(pending);
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <p style={{ font: 'var(--type-body-small)', color: 'var(--color-text-secondary)' }}>Loading pending colonies...</p>;
  }

  return (
    <div style={styles.container}>
      <h4 style={styles.sectionTitle}>Select Isolated Colony for Gram & Biochemical Tests</h4>
      {colonies.length === 0 ? (
        <p style={{ font: 'var(--type-body-small)', color: 'var(--color-text-secondary)' }}>
          No colonies currently awaiting identification.
        </p>
      ) : (
        <div style={styles.grid}>
          {colonies.map((col) => (
            <Card key={col.colonyId} style={styles.card}>
              <div style={styles.cardHeader}>
                <strong>Colony ID: {col.colonyId}</strong>
                <span style={styles.statusBadge}>{col.status}</span>
              </div>
              <div style={styles.body}>
                <p>Parent Plate: <strong>{col.plateBarcode}</strong></p>
                <p>Culture Accession: <strong>{col.cultureAccession}</strong></p>
                <p>Morphology: <strong>{col.morphology}</strong></p>
                <p>Colony Color: <strong>{col.color}</strong></p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <Button variant="solid" onClick={() => onSelectColony(col)}>
                  Select Colony
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  },
  sectionTitle: {
    font: 'var(--type-heading-subsection)',
    margin: '0 0 var(--spacing-xs) 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 'var(--spacing-md)',
  },
  card: {
    padding: 'var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xs)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: '6px',
  },
  statusBadge: {
    fontSize: '0.65rem',
    fontWeight: 'bold',
    color: 'var(--color-brand-primary)',
    backgroundColor: 'var(--color-brand-secondary-bg)',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  body: {
    fontSize: '0.82rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
};
export default ColonySelectionPanel;
